// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Placeholder FHE types for early development.
/// @dev Replace with Zama Protocol FHE imports/types when integrating for real.
type euint256 is uint256;

library FheUint256 {
    function wrap(uint256 v) internal pure returns (euint256) {
        return euint256.wrap(v);
    }

    function unwrap(euint256 v) internal pure returns (uint256) {
        return euint256.unwrap(v);
    }
}

