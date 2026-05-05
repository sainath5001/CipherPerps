// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {euint256, FheUint256} from "./fhe/FheTypes.sol";

interface IPositionManagerLike {
    struct Position {
        bool isOpen;
        bool isLong;
        uint256 collateralUsdc;
        uint256 entryPrice1e8;
        euint256 sizeNotionalUsdc1e6;
        euint256 leverageE18;
    }

    function getPosition(address user) external view returns (Position memory);
    function liquidate(address user, address liquidator) external;
}

interface IPriceOracleLike2 {
    function getPrice1e8() external view returns (uint256);
}

interface ITradingEngineLike2 {
    function computePnlUsdc(bool isLong, uint256 entryPrice1e8, uint256 priceNow1e8, euint256 sizeNotionalUsdc1e6)
        external
        pure
        returns (int256);
}

/// @notice Minimal liquidation gate for MVP.
/// @dev Placeholder risk: liquidatable if equity < maintenanceMarginBps * notional.
contract LiquidationEngine {
    using FheUint256 for euint256;

    IPositionManagerLike public immutable pm;
    IPriceOracleLike2 public immutable oracle;
    ITradingEngineLike2 public immutable engine;

    uint256 public immutable maintenanceMarginBps;

    error NotLiquidatable();

    constructor(address pm_, address oracle_, address engine_, uint256 maintenanceMarginBps_) {
        pm = IPositionManagerLike(pm_);
        oracle = IPriceOracleLike2(oracle_);
        engine = ITradingEngineLike2(engine_);
        maintenanceMarginBps = maintenanceMarginBps_;
    }

    function isLiquidatable(address user) public view returns (bool) {
        IPositionManagerLike.Position memory p = pm.getPosition(user);
        if (!p.isOpen) return false;

        uint256 priceNow = oracle.getPrice1e8();
        int256 pnl = engine.computePnlUsdc(p.isLong, p.entryPrice1e8, priceNow, p.sizeNotionalUsdc1e6);

        int256 equity = int256(p.collateralUsdc) + pnl;
        uint256 notional = p.sizeNotionalUsdc1e6.unwrap(); // placeholder
        uint256 mm = (notional * maintenanceMarginBps) / 10_000;

        return equity < int256(mm);
    }

    function liquidate(address user) external {
        if (!isLiquidatable(user)) revert NotLiquidatable();
        pm.liquidate(user, msg.sender);
    }
}

