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
    function liquidate(address user, address liquidator, uint256 rewardUsdc) external;
}

/// @notice Manual liquidation based on an encrypted health factor.
/// @dev Health rule: health = collateral / (positionSize * leverage).
contract LiquidationEngine {
    using FheUint256 for euint256;

    IPositionManagerLike public immutable pm;

    /// @notice Liquidation threshold on health, scaled by 1e18.
    /// @dev Liquidate when healthE18 < thresholdE18.
    uint256 public immutable thresholdE18;

    /// @notice Liquidator reward in basis points of collateral (1 bp = 0.01%).
    uint256 public immutable liquidatorRewardBps;

    error NotLiquidatable();
    error BadParams();

    constructor(address pm_, uint256 thresholdE18_, uint256 liquidatorRewardBps_) {
        if (pm_ == address(0)) revert BadParams();
        // threshold in (0, 1e18] is a reasonable MVP bound
        if (thresholdE18_ == 0 || thresholdE18_ > 1e18) revert BadParams();
        // cap rewards to 10% for MVP safety
        if (liquidatorRewardBps_ > 1_000) revert BadParams();
        pm = IPositionManagerLike(pm_);
        thresholdE18 = thresholdE18_;
        liquidatorRewardBps = liquidatorRewardBps_;
    }

    function isLiquidatable(address user) public view returns (bool) {
        IPositionManagerLike.Position memory p = pm.getPosition(user);
        if (!p.isOpen) return false;

        // denom = positionSize * leverage (leverage is 1e18-scaled).
        // To keep units reasonable: exposure = (positionSize * leverage) / 1e18.
        uint256 size = p.positionSize.unwrap(); // placeholder until real FHE decryption-free ops
        uint256 levE18 = p.leverage.unwrap(); // placeholder
        if (size == 0) return false;

        // Avoid revert on overflow by bounding earlier in PositionManager (MVP placeholder).
        uint256 exposure = (size * levE18) / 1e18;
        if (exposure == 0) return false;

        uint256 healthE18 = (p.collateralUsdc * 1e18) / exposure;
        return healthE18 < thresholdE18;
    }

    function liquidate(address user) external {
        if (!isLiquidatable(user)) revert NotLiquidatable();

        IPositionManagerLike.Position memory p = pm.getPosition(user);
        uint256 reward = (p.collateralUsdc * liquidatorRewardBps) / 10_000;
        pm.liquidate(user, msg.sender, reward);
    }
}

