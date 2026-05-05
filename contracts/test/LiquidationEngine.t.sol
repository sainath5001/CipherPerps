// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";

import {MockUSDC} from "../src/MockUSDC.sol";
import {MockAggregatorV3} from "../src/mocks/MockAggregatorV3.sol";
import {PriceOracle} from "../src/PriceOracle.sol";
import {PositionManager} from "../src/PositionManager.sol";
import {LiquidationEngine} from "../src/LiquidationEngine.sol";
import {FheUint256} from "../src/fhe/FheTypes.sol";

contract LiquidationEngineTest is Test {
    using FheUint256 for uint256;

    address trader = address(0xBEEF);
    address liquidator = address(0xCAFE);

    MockUSDC usdc;
    MockAggregatorV3 feed;
    PriceOracle oracle;
    PositionManager pm;
    LiquidationEngine liq;

    function setUp() public {
        usdc = new MockUSDC();
        feed = new MockAggregatorV3(8, 3_000e8);
        oracle = new PriceOracle(address(feed), 1 hours);
        pm = new PositionManager(address(usdc), address(oracle));
        liq = new LiquidationEngine(address(pm), 5e16, 50); // threshold=5%, reward=0.5%
        pm.setLiquidationEngine(address(liq));

        usdc.mint(trader, 10_000e6);
        vm.startPrank(trader);
        usdc.approve(address(pm), type(uint256).max);
        pm.depositCollateral(1_000e6);
        vm.stopPrank();
    }

    function test_constructorParams_validation() public {
        vm.expectRevert(LiquidationEngine.BadParams.selector);
        new LiquidationEngine(address(0), 5e16, 50);

        vm.expectRevert(LiquidationEngine.BadParams.selector);
        new LiquidationEngine(address(pm), 0, 50);

        vm.expectRevert(LiquidationEngine.BadParams.selector);
        new LiquidationEngine(address(pm), 2e18, 50);

        vm.expectRevert(LiquidationEngine.BadParams.selector);
        new LiquidationEngine(address(pm), 5e16, 1001);
    }

    function test_isLiquidatable_falseWhenNoPosition() public view {
        bool can = liq.isLiquidatable(trader);
        assertFalse(can);
    }

    function test_isLiquidatable_healthAtThreshold_notLiquidatable() public {
        // healthE18 = collateral*1e18 / exposure
        // threshold = 0.05e18 => health == 0.05e18 should NOT be liquidatable (strict <).
        //
        // choose exposure = collateral / 0.05 = 20 * collateral.
        // collateral = 1000e6, pick size=1000e6, lev=20e18 => exposure=(1000e6*20e18)/1e18=20_000e6.
        vm.startPrank(trader);
        pm.openPosition(FheUint256.wrap(1_000e6), FheUint256.wrap(20e18), true);
        vm.stopPrank();

        assertFalse(liq.isLiquidatable(trader));
    }

    function test_isLiquidatable_trueBelowThreshold() public {
        // Make exposure slightly bigger -> health slightly smaller than threshold.
        vm.startPrank(trader);
        pm.openPosition(FheUint256.wrap(1_000e6), FheUint256.wrap(21e18), true);
        vm.stopPrank();

        assertTrue(liq.isLiquidatable(trader));
    }

    function test_liquidate_revertsWhenHealthy() public {
        vm.startPrank(trader);
        pm.openPosition(FheUint256.wrap(1_000e6), FheUint256.wrap(10e18), true); // exposure=10_000e6 => health=0.1 > 0.05
        vm.stopPrank();

        vm.prank(liquidator);
        vm.expectRevert(LiquidationEngine.NotLiquidatable.selector);
        liq.liquidate(trader);
    }

    function test_liquidate_paysRewardAndClosesPosition() public {
        vm.startPrank(trader);
        pm.openPosition(FheUint256.wrap(100_000e6), FheUint256.wrap(20e18), true); // very unsafe
        vm.stopPrank();

        uint256 liqBefore = usdc.balanceOf(liquidator);
        vm.prank(liquidator);
        liq.liquidate(trader);
        uint256 liqAfter = usdc.balanceOf(liquidator);

        // reward = 0.5% of 1000e6 = 5e6
        assertEq(liqAfter - liqBefore, 5e6);

        PositionManager.Position memory p = pm.getPosition(trader);
        assertFalse(p.isOpen);
    }
}

