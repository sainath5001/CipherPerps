// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";

import {MockUSDC} from "../src/MockUSDC.sol";
import {PriceOracle} from "../src/PriceOracle.sol";
import {TradingEngine} from "../src/TradingEngine.sol";
import {PositionManager} from "../src/PositionManager.sol";
import {LiquidationEngine} from "../src/LiquidationEngine.sol";

contract DeployCipherPerps is Script {
    address internal constant SEPOLIA_ETH_USD_FEED = 0x694AA1769357215DE4FAC081bf1f309aDC325306;

    function run() external {
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPk);

        // Sepolia demo defaults: real Chainlink ETH/USD feed (override via env).
        MockUSDC usdc = new MockUSDC();
        address feed = vm.envOr("CHAINLINK_FEED", SEPOLIA_ETH_USD_FEED);
        PriceOracle oracle = new PriceOracle(feed, 1 hours);
        TradingEngine engine = new TradingEngine();
        PositionManager pm = new PositionManager(address(usdc), address(oracle));
        // thresholdE18=0.05 (5%), rewardBps=50 (0.5%)
        LiquidationEngine liq = new LiquidationEngine(address(pm), 5e16, 50);
        pm.setLiquidationEngine(address(liq));

        vm.stopBroadcast();
    }
}

