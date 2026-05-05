// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {euint256, FheUint256} from "./fhe/FheTypes.sol";

interface IERC20Like {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
}

interface IPriceOracleLike {
    function getPrice1e8() external view returns (uint256);
}

interface ITradingEngineLike {
    function computePnlUsdc(bool isLong, uint256 entryPrice1e8, uint256 priceNow1e8, euint256 sizeNotionalUsdc1e6)
        external
        pure
        returns (int256);
}

/// @notice Stores per-user position state and collateral.
/// @dev MVP constraints: single market, one position per user.
contract PositionManager {
    using FheUint256 for euint256;

    error PositionExists();
    error NoPosition();
    error NotLiquidationEngine();
    error InvalidLeverage();

    struct Position {
        bool isOpen;
        bool isLong; // public by design for MVP
        uint256 collateralUsdc; // public
        uint256 entryPrice1e8; // public
        euint256 sizeNotionalUsdc1e6; // private (placeholder type)
        euint256 leverageE18; // private (placeholder type), leverage with 1e18 scale
    }

    IERC20Like public immutable collateralToken; // USDC
    IPriceOracleLike public immutable oracle;
    ITradingEngineLike public immutable engine;
    address public liquidationEngine;

    mapping(address => uint256) public collateralBalance; // free collateral
    mapping(address => Position) internal positions;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event PositionOpened(address indexed user, bool isLong, uint256 collateralUsdc, uint256 entryPrice1e8);
    event PositionClosed(address indexed user, int256 pnlUsdc, uint256 exitPrice1e8);
    event PositionLiquidated(address indexed user, address indexed liquidator, uint256 price1e8);

    constructor(address usdc, address oracle_, address engine_) {
        collateralToken = IERC20Like(usdc);
        oracle = IPriceOracleLike(oracle_);
        engine = ITradingEngineLike(engine_);
    }

    function setLiquidationEngine(address liq) external {
        // For hackathon MVP: deployer-admin is omitted; set once if unset.
        require(liquidationEngine == address(0), "SET");
        liquidationEngine = liq;
    }

    function getPosition(address user) external view returns (Position memory) {
        return positions[user];
    }

    function deposit(uint256 amountUsdc) external {
        require(collateralToken.transferFrom(msg.sender, address(this), amountUsdc), "TRANSFER_FROM");
        collateralBalance[msg.sender] += amountUsdc;
        emit Deposit(msg.sender, amountUsdc);
    }

    function withdraw(uint256 amountUsdc) external {
        require(collateralBalance[msg.sender] >= amountUsdc, "BAL");
        collateralBalance[msg.sender] -= amountUsdc;
        require(collateralToken.transfer(msg.sender, amountUsdc), "TRANSFER");
        emit Withdraw(msg.sender, amountUsdc);
    }

    function openPosition(bool isLong, uint256 collateralToLockUsdc, euint256 sizeNotionalUsdc1e6, euint256 leverageE18)
        external
    {
        Position storage p = positions[msg.sender];
        if (p.isOpen) revert PositionExists();

        uint256 lev = leverageE18.unwrap(); // placeholder
        if (lev < 1e18 || lev > 50e18) revert InvalidLeverage();

        require(collateralBalance[msg.sender] >= collateralToLockUsdc, "BAL");
        collateralBalance[msg.sender] -= collateralToLockUsdc;

        uint256 entry = oracle.getPrice1e8();
        positions[msg.sender] = Position({
            isOpen: true,
            isLong: isLong,
            collateralUsdc: collateralToLockUsdc,
            entryPrice1e8: entry,
            sizeNotionalUsdc1e6: sizeNotionalUsdc1e6,
            leverageE18: leverageE18
        });

        emit PositionOpened(msg.sender, isLong, collateralToLockUsdc, entry);
    }

    function closePosition() external {
        Position storage p = positions[msg.sender];
        if (!p.isOpen) revert NoPosition();

        uint256 priceNow = oracle.getPrice1e8();
        int256 pnl = engine.computePnlUsdc(p.isLong, p.entryPrice1e8, priceNow, p.sizeNotionalUsdc1e6);

        uint256 returnedCollateral = p.collateralUsdc;
        delete positions[msg.sender];

        // Settlement in plaintext USDC (MVP). Realized PnL becomes observable via this transfer.
        if (pnl >= 0) {
            uint256 payout = returnedCollateral + uint256(pnl);
            require(collateralToken.transfer(msg.sender, payout), "TRANSFER");
        } else {
            uint256 loss = uint256(-pnl);
            uint256 payout = returnedCollateral > loss ? (returnedCollateral - loss) : 0;
            require(collateralToken.transfer(msg.sender, payout), "TRANSFER");
        }

        emit PositionClosed(msg.sender, pnl, priceNow);
    }

    function liquidate(address user, address liquidator) external {
        if (msg.sender != liquidationEngine) revert NotLiquidationEngine();

        Position storage p = positions[user];
        if (!p.isOpen) revert NoPosition();

        uint256 priceNow = oracle.getPrice1e8();
        delete positions[user];

        // For MVP: funds stay in contract; liquidation incentive handled by LiquidationEngine in later steps.
        emit PositionLiquidated(user, liquidator, priceNow);
    }
}

