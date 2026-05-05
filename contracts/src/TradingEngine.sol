// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {euint256, FheUint256} from "./fhe/FheTypes.sol";

/// @notice Minimal PnL math for a single-asset perp.
/// @dev Uses placeholder euint256 (not real FHE yet).
contract TradingEngine {
    using FheUint256 for euint256;

    /// @notice Computes PnL in collateral units (USDC decimals assumed 6) using a 1e8 price.
    /// @dev For MVP we interpret `size` as "USD notional with 1e6 decimals" to keep it simple.
    ///      PnL = notional * (priceNow - entryPrice) / entryPrice, signed for long/short.
    function computePnlUsdc(
        bool isLong,
        uint256 entryPrice1e8,
        uint256 priceNow1e8,
        euint256 sizeNotionalUsdc1e6
    ) external pure returns (int256 pnlUsdc) {
        uint256 size = sizeNotionalUsdc1e6.unwrap(); // placeholder
        if (entryPrice1e8 == 0) return 0;

        int256 dP = int256(priceNow1e8) - int256(entryPrice1e8);
        int256 base = (int256(size) * dP) / int256(entryPrice1e8);

        // `base` is in 1e6 units because size is 1e6; price ratio is unitless.
        pnlUsdc = isLong ? base : -base;
    }
}

