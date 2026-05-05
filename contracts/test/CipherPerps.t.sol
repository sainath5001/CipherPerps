// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";

import {MockUSDC} from "../src/MockUSDC.sol";
import {MockAggregatorV3} from "../src/mocks/MockAggregatorV3.sol";
import {PriceOracle} from "../src/PriceOracle.sol";
import {TradingEngine} from "../src/TradingEngine.sol";
import {PositionManager} from "../src/PositionManager.sol";
import {LiquidationEngine} from "../src/LiquidationEngine.sol";
import {FheUint256} from "../src/fhe/FheTypes.sol";

contract CipherPerpsTest is Test {
    using FheUint256 for uint256;

    address trader = address(0xBEEF);

    MockUSDC usdc;
    MockAggregatorV3 feed;
    PriceOracle oracle;
    TradingEngine engine;
    PositionManager pm;
    LiquidationEngine liq;

    function setUp() public {
        usdc = new MockUSDC();
        feed = new MockAggregatorV3(8, 3_000e8);
        oracle = new PriceOracle(address(feed), 1 hours);
        engine = new TradingEngine();
        pm = new PositionManager(address(usdc), address(oracle), address(engine));
        liq = new LiquidationEngine(address(pm), address(oracle), address(engine), 500);
        pm.setLiquidationEngine(address(liq));

        usdc.mint(trader, 10_000e6);

        vm.startPrank(trader);
        usdc.approve(address(pm), type(uint256).max);
        pm.deposit(1_000e6);
        vm.stopPrank();
    }

    function test_openAndClosePosition_happyPath() public {
        vm.startPrank(trader);

        pm.openPosition(
            true,
            500e6,
            FheUint256.wrap(5_000e6), // $5k notional
            FheUint256.wrap(5e18) // 5x
        );

        // price up 10%
        feed.setAnswer(3_300e8);
        pm.closePosition();

        vm.stopPrank();
    }

    function test_liquidationFlag_canBecomeTrue() public {
        vm.startPrank(trader);

        pm.openPosition(
            true,
            200e6,
            FheUint256.wrap(10_000e6),
            FheUint256.wrap(10e18)
        );

        // big drop
        feed.setAnswer(1_500e8);
        vm.stopPrank();

        bool can = liq.isLiquidatable(trader);
        assertTrue(can);
    }
}

