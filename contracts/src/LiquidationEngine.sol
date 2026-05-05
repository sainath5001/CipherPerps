// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {euint256, FheUint256} from "./fhe/FheTypes.sol";

interface IPositionManagerLike {
    struct Position {
        bool isOpen;
        bool isLong;
        uint256 collateralUsdc;
        uint256 entryPrice1e8;
        euint256 positionSize;
        euint256 leverage;
    }

    function getPosition(address user) external view returns (Position memory);
    function liquidate(address user, address liquidator) external;
}

interface IPriceOracleLike2 {
    function getPrice1e8() external view returns (uint256);
}

interface ITradingEngineLike2 {
    function computePnl(bool isLong, uint256 entryPrice, uint256 currentPrice, euint256 positionSize)
        external
        pure
        returns (euint256);

    function computeLoss(bool isLong, uint256 entryPrice, uint256 currentPrice, euint256 positionSize)
        external
        pure
        returns (euint256);
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
        // For liquidation we care about downside; PnL as defined is non-negative magnitude.
        euint256 lossEnc = engine.computeLoss(p.isLong, p.entryPrice1e8, priceNow, p.positionSize);
        uint256 loss = lossEnc.unwrap(); // placeholder until real encrypted comparisons

        uint256 equity = p.collateralUsdc > loss ? (p.collateralUsdc - loss) : 0;
        uint256 notional = p.positionSize.unwrap(); // placeholder
        uint256 mm = (notional * maintenanceMarginBps) / 10_000;

        return equity < mm;
    }

    function liquidate(address user) external {
        if (!isLiquidatable(user)) revert NotLiquidatable();
        pm.liquidate(user, msg.sender);
    }
}

