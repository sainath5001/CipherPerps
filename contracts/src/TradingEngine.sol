// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {euint256, FheUint256} from "./fhe/FheTypes.sol";

/// @notice Minimal PnL math for a single-asset perp.
/// @dev Uses placeholder euint256 (not real FHE yet).
contract TradingEngine {
    using FheUint256 for euint256;

    /// @notice Computes encrypted loss magnitude (>=0) for liquidation/risk checks.
    /// @dev Returns 0 if the position is in profit or flat.
    function computeLoss(
        bool isLong,
        uint256 entryPrice,
        uint256 currentPrice,
        euint256 positionSize
    ) external pure returns (euint256 loss) {
        uint256 size = positionSize.unwrap(); // placeholder

        uint256 delta;
        if (isLong) {
            delta = entryPrice > currentPrice ? (entryPrice - currentPrice) : 0;
        } else {
            delta = currentPrice > entryPrice ? (currentPrice - entryPrice) : 0;
        }

        loss = FheUint256.wrap(delta * size);
    }

    /// @notice Computes encrypted PnL using public prices and encrypted position size.
    /// @dev Price inputs are public (e.g. 1e8 from Chainlink). Size stays encrypted.
    ///      Long:  (currentPrice - entryPrice) * positionSize
    ///      Short: (entryPrice - currentPrice) * positionSize
    ///
    ///      With real Zama FHE, this multiplication happens on ciphertext.
    ///      For now, `euint256` is a placeholder wrapper type.
    function computePnl(
        bool isLong,
        uint256 entryPrice,
        uint256 currentPrice,
        euint256 positionSize
    ) external pure returns (euint256 pnl) {
        uint256 size = positionSize.unwrap(); // placeholder

        uint256 delta;
        if (isLong) {
            delta = currentPrice > entryPrice ? (currentPrice - entryPrice) : 0;
        } else {
            delta = entryPrice > currentPrice ? (entryPrice - currentPrice) : 0;
        }

        pnl = FheUint256.wrap(delta * size);
    }
}

