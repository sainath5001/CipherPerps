// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";

import {MockUSDC} from "../src/MockUSDC.sol";
import {MockAggregatorV3} from "../src/mocks/MockAggregatorV3.sol";
import {PriceOracle} from "../src/PriceOracle.sol";
import {TradingEngine} from "../src/TradingEngine.sol";
import {PositionManager} from "../src/PositionManager.sol";
import {LiquidationEngine} from "../src/LiquidationEngine.sol";

contract DeployCipherPerps is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPk);

        // Local/dev defaults (override by editing or forking).
        MockUSDC usdc = new MockUSDC();
        MockAggregatorV3 feed = new MockAggregatorV3(8, 3_000e8); // ETH = $3000
        PriceOracle oracle = new PriceOracle(address(feed), 1 hours);
        TradingEngine engine = new TradingEngine();
        PositionManager pm = new PositionManager(address(usdc), address(oracle), address(engine));
        LiquidationEngine liq = new LiquidationEngine(address(pm), address(oracle), address(engine), 500); // 5% mm
        pm.setLiquidationEngine(address(liq));

        vm.stopBroadcast();
    }
}

