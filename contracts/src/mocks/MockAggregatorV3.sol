// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Simple mock of Chainlink AggregatorV3 for local testing.
contract MockAggregatorV3 {
    uint8 public immutable decimals;

    int256 public answer;
    uint256 public updatedAt;

    constructor(uint8 decimals_, int256 initialAnswer) {
        decimals = decimals_;
        setAnswer(initialAnswer);
    }

    function setAnswer(int256 newAnswer) public {
        answer = newAnswer;
        updatedAt = block.timestamp;
    }

    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer_, uint256 startedAt, uint256 updatedAt_, uint80 answeredInRound)
    {
        return (1, answer, updatedAt, updatedAt, 1);
    }
}

