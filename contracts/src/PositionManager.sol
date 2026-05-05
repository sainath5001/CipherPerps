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

/// @notice Stores per-user position state and collateral.
/// @dev MVP constraints: single market, one position per user.
contract PositionManager {
    using FheUint256 for euint256;

    error PositionExists();
    error NoPosition();
    error NotLiquidationEngine();
    error NoCollateral();
    error InvalidLeverage();

    struct Position {
        bool isOpen;
        bool isLong; // public by design for MVP
        uint256 collateralUsdc; // public
        uint256 entryPrice1e8; // public
        euint256 positionSize; // encrypted (placeholder type)
        euint256 leverage; // encrypted (placeholder type)
    }

    IERC20Like public immutable collateralToken; // USDC
    IPriceOracleLike public immutable oracle;
    address public liquidationEngine;

    mapping(address => uint256) public collateralBalance; // free collateral
    mapping(address => Position) internal positions;

    event CollateralDeposited(address indexed user, uint256 amount);
    event PositionOpened(address indexed user, bool isLong, uint256 collateralUsdc, uint256 entryPrice1e8);
    event PositionClosed(address indexed user);
    event PositionLiquidated(address indexed user, address indexed liquidator, uint256 price1e8);

    constructor(address usdc, address oracle_) {
        collateralToken = IERC20Like(usdc);
        oracle = IPriceOracleLike(oracle_);
    }

    function setLiquidationEngine(address liq) external {
        // For hackathon MVP: deployer-admin is omitted; set once if unset.
        require(liquidationEngine == address(0), "SET");
        liquidationEngine = liq;
    }

    function getPosition(address user) external view returns (Position memory) {
        return positions[user];
    }

    function depositCollateral(uint256 amount) external {
        require(amount > 0, "AMOUNT");
        require(collateralToken.transferFrom(msg.sender, address(this), amount), "TRANSFER_FROM");
        collateralBalance[msg.sender] += amount;
        emit CollateralDeposited(msg.sender, amount);
    }

    function openPosition(euint256 size, euint256 leverage, bool isLong) external {
        Position storage p = positions[msg.sender];
        if (p.isOpen) revert PositionExists();

        uint256 freeCollateral = collateralBalance[msg.sender];
        if (freeCollateral == 0) revert NoCollateral();

        uint256 lev = leverage.unwrap(); // placeholder
        if (lev < 1e18 || lev > 50e18) revert InvalidLeverage();

        // MVP: lock all deposited collateral into the position.
        collateralBalance[msg.sender] = 0;

        uint256 entry = oracle.getPrice1e8();
        positions[msg.sender] = Position({
            isOpen: true,
            isLong: isLong,
            collateralUsdc: freeCollateral,
            entryPrice1e8: entry,
            positionSize: size,
            leverage: leverage
        });

        emit PositionOpened(msg.sender, isLong, freeCollateral, entry);
    }

    function closePosition() external {
        Position storage p = positions[msg.sender];
        if (!p.isOpen) revert NoPosition();

        uint256 returnedCollateral = p.collateralUsdc;
        delete positions[msg.sender];

        // Storage-only MVP: return locked collateral to the user's free balance.
        collateralBalance[msg.sender] += returnedCollateral;
        emit PositionClosed(msg.sender);
    }

    function liquidate(address user, address liquidator) external {
        if (msg.sender != liquidationEngine) revert NotLiquidationEngine();

        Position storage p = positions[user];
        if (!p.isOpen) revert NoPosition();

        uint256 priceNow = oracle.getPrice1e8();
        // For MVP: seized collateral remains in the contract (insurance fund / future logic).
        delete positions[user];

        emit PositionLiquidated(user, liquidator, priceNow);
    }
}

