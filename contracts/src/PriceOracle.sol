// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IChainlinkAggregatorV3} from "./interfaces/IChainlinkAggregatorV3.sol";

/// @notice Thin adapter around a Chainlink ETH/USD style feed.
/// @dev Returns a normalized 1e8 price (same as most Chainlink USD feeds).
contract PriceOracle {
    error BadPrice();
    error StalePrice();

    IChainlinkAggregatorV3 public immutable feed;
    uint256 public immutable staleAfter;

    constructor(address feed_, uint256 staleAfterSeconds) {
        feed = IChainlinkAggregatorV3(feed_);
        staleAfter = staleAfterSeconds;
    }

    function getPrice1e8() external view returns (uint256) {
        (, int256 answer,, uint256 updatedAt,) = feed.latestRoundData();
        if (answer <= 0) revert BadPrice();
        if (block.timestamp - updatedAt > staleAfter) revert StalePrice();

        uint256 p = uint256(answer);
        uint8 d = feed.decimals();
        if (d == 8) return p;
        if (d > 8) return p / (10 ** (d - 8));
        return p * (10 ** (8 - d));
    }
}

