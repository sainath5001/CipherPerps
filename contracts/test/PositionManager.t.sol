// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";

import {MockUSDC} from "../src/MockUSDC.sol";
import {MockAggregatorV3} from "../src/mocks/MockAggregatorV3.sol";
import {PriceOracle} from "../src/PriceOracle.sol";
import {PositionManager} from "../src/PositionManager.sol";
import {FheUint256} from "../src/fhe/FheTypes.sol";

contract PositionManagerTest is Test {
    using FheUint256 for uint256;

    address owner = address(this);
    address alice = address(0xA11CE);
    address bob = address(0xB0B);
    address liqEngine = address(0x1);

    MockUSDC usdc;
    MockAggregatorV3 feed;
    PriceOracle oracle;
    PositionManager pm;

    function setUp() public {
        usdc = new MockUSDC();
        feed = new MockAggregatorV3(8, 3_000e8);
        oracle = new PriceOracle(address(feed), 1 hours);
        pm = new PositionManager(address(usdc), address(oracle));

        usdc.mint(alice, 1_000_000e6);
        usdc.mint(bob, 1_000_000e6);

        vm.prank(alice);
        usdc.approve(address(pm), type(uint256).max);
        vm.prank(bob);
        usdc.approve(address(pm), type(uint256).max);
    }

    function test_setLiquidationEngine_onlyOwnerAndOnce() public {
        vm.prank(alice);
        vm.expectRevert(PositionManager.NotOwner.selector);
        pm.setLiquidationEngine(liqEngine);

        pm.setLiquidationEngine(liqEngine);

        vm.expectRevert(bytes("SET"));
        pm.setLiquidationEngine(address(0x2));
    }

    function test_setLiquidationEngine_rejectZero() public {
        vm.expectRevert(PositionManager.InvalidLiquidationEngine.selector);
        pm.setLiquidationEngine(address(0));
    }

    function test_depositCollateral_updatesBalanceAndEmits() public {
        vm.startPrank(alice);
        vm.expectEmit(true, false, false, true);
        emit PositionManager.CollateralDeposited(alice, 123e6);
        pm.depositCollateral(123e6);
        vm.stopPrank();

        assertEq(pm.collateralBalance(alice), 123e6);
    }

    function test_depositCollateral_zeroReverts() public {
        vm.prank(alice);
        vm.expectRevert(bytes("AMOUNT"));
        pm.depositCollateral(0);
    }

    function test_openPosition_requiresCollateral() public {
        vm.prank(alice);
        vm.expectRevert(PositionManager.NoCollateral.selector);
        pm.openPosition(FheUint256.wrap(1e6), FheUint256.wrap(2e18), true);
    }

    function test_openPosition_storesPublicAndEncryptedFields() public {
        vm.startPrank(alice);
        pm.depositCollateral(500e6);

        uint256 expectedEntry = oracle.getPrice1e8();
        pm.openPosition(FheUint256.wrap(10_000e6), FheUint256.wrap(3e18), true);
        vm.stopPrank();

        PositionManager.Position memory p = pm.getPosition(alice);
        assertTrue(p.isOpen);
        assertTrue(p.isLong);
        assertEq(p.collateralUsdc, 500e6);
        assertEq(p.entryPrice1e8, expectedEntry);
        // placeholder unwrap checks
        assertEq(FheUint256.unwrap(p.positionSize), 10_000e6);
        assertEq(FheUint256.unwrap(p.leverage), 3e18);

        assertEq(pm.collateralBalance(alice), 0); // locked
    }

    function test_openPosition_preventsMultiplePositions() public {
        vm.startPrank(alice);
        pm.depositCollateral(100e6);
        pm.openPosition(FheUint256.wrap(1e6), FheUint256.wrap(2e18), true);

        // even if she deposits more, cannot open again until closed
        pm.depositCollateral(50e6);
        vm.expectRevert(PositionManager.PositionExists.selector);
        pm.openPosition(FheUint256.wrap(1e6), FheUint256.wrap(2e18), false);
        vm.stopPrank();
    }

    function test_openPosition_leverageBounds() public {
        vm.startPrank(alice);
        pm.depositCollateral(100e6);

        vm.expectRevert(PositionManager.InvalidLeverage.selector);
        pm.openPosition(FheUint256.wrap(1e6), FheUint256.wrap(1e18 - 1), true);

        vm.expectRevert(PositionManager.InvalidLeverage.selector);
        pm.openPosition(FheUint256.wrap(1e6), FheUint256.wrap(50e18 + 1), true);

        pm.openPosition(FheUint256.wrap(1e6), FheUint256.wrap(1e18), true); // ok min
        vm.stopPrank();
    }

    function test_openPosition_sizeBounds() public {
        vm.startPrank(alice);
        pm.depositCollateral(100e6);

        uint256 max = pm.MAX_POSITION_SIZE();
        assertEq(max, 1_000_000_000e6);

        vm.expectRevert(PositionManager.InvalidPositionSize.selector);
        pm.openPosition(FheUint256.wrap(0), FheUint256.wrap(2e18), true);

        vm.expectRevert(PositionManager.InvalidPositionSize.selector);
        pm.openPosition(FheUint256.wrap(max + 1), FheUint256.wrap(2e18), true);

        pm.openPosition(FheUint256.wrap(max), FheUint256.wrap(2e18), true);
        vm.stopPrank();
    }

    function test_closePosition_returnsCollateralToFreeBalance() public {
        vm.startPrank(alice);
        pm.depositCollateral(250e6);
        pm.openPosition(FheUint256.wrap(5_000e6), FheUint256.wrap(5e18), true);

        assertEq(pm.collateralBalance(alice), 0);
        pm.closePosition();
        assertEq(pm.collateralBalance(alice), 250e6);

        PositionManager.Position memory p = pm.getPosition(alice);
        assertFalse(p.isOpen);
        vm.stopPrank();
    }

    function test_closePosition_noPositionReverts() public {
        vm.prank(alice);
        vm.expectRevert(PositionManager.NoPosition.selector);
        pm.closePosition();
    }

    function test_liquidate_onlyLiquidationEngine() public {
        vm.startPrank(alice);
        pm.depositCollateral(100e6);
        pm.openPosition(FheUint256.wrap(1e6), FheUint256.wrap(2e18), true);
        vm.stopPrank();

        vm.prank(owner);
        pm.setLiquidationEngine(liqEngine);

        vm.prank(bob);
        vm.expectRevert(PositionManager.NotLiquidationEngine.selector);
        pm.liquidate(alice, bob, 1);
    }

    function test_liquidate_paysRewardCappedByCollateral_andCloses() public {
        vm.startPrank(alice);
        pm.depositCollateral(100e6);
        pm.openPosition(FheUint256.wrap(1e6), FheUint256.wrap(2e18), true);
        vm.stopPrank();

        pm.setLiquidationEngine(liqEngine);

        uint256 bobBefore = usdc.balanceOf(bob);
        vm.prank(liqEngine);
        pm.liquidate(alice, bob, 150e6); // > collateral => cap
        uint256 bobAfter = usdc.balanceOf(bob);

        assertEq(bobAfter - bobBefore, 100e6);

        PositionManager.Position memory p = pm.getPosition(alice);
        assertFalse(p.isOpen);
    }
}

