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
    address liquidator = address(0xCAFE);

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
        pm = new PositionManager(address(usdc), address(oracle));
        liq = new LiquidationEngine(address(pm), 5e16, 50); // 5% health threshold, 0.5% reward
        pm.setLiquidationEngine(address(liq));

        usdc.mint(trader, 10_000e6);

        vm.startPrank(trader);
        usdc.approve(address(pm), type(uint256).max);
        pm.depositCollateral(1_000e6);
        vm.stopPrank();
    }

    function test_openAndClosePosition_happyPath() public {
        vm.startPrank(trader);

        pm.openPosition(FheUint256.wrap(5_000e6), FheUint256.wrap(5e18), true);

        pm.closePosition();

        vm.stopPrank();
    }

    function test_liquidationFlag_canBecomeTrue() public {
        vm.startPrank(trader);

        // Make health low by setting large size * leverage relative to collateral.
        pm.openPosition(FheUint256.wrap(100_000e6), FheUint256.wrap(20e18), true);
        vm.stopPrank();

        bool can = liq.isLiquidatable(trader);
        assertTrue(can);

        uint256 balBefore = usdc.balanceOf(liquidator);
        vm.prank(liquidator);
        liq.liquidate(trader);
        uint256 balAfter = usdc.balanceOf(liquidator);
        assertGt(balAfter, balBefore);
    }
}

