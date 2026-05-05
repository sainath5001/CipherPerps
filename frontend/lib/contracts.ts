import { Address, parseAbi } from "viem";

export const CONTRACTS = {
  sepolia: {
    usdc: "0x50eDe9B383248648d446646BE0aB44927279d766" as Address,
    priceOracle: "0xe73ed2770E308cA94CB2Ad2E828af3832c19bfb2" as Address,
    tradingEngine: "0x9A77562d9189c0A99Bccb0bc2049384Dca7EAf81" as Address,
    positionManager: "0xFe97B52dC4219979e5524D244B8D8C0A39879B5F" as Address,
    liquidationEngine: "0x3886eC7a6ca3841944a27439126096d6978f8884" as Address
  }
} as const;

export const positionManagerAbi = parseAbi([
  "function collateralBalance(address) view returns (uint256)",
  "function depositCollateral(uint256 amount) returns ()",
  "function openPosition(uint256 size,uint256 leverage,bool isLong) returns ()",
  "function closePosition() returns ()",
  "function getPosition(address user) view returns (bool,bool,uint256,uint256,uint256,uint256)"
]);

export const priceOracleAbi = parseAbi([
  "function getLatestPrice() view returns (uint256)",
  "function getPrice1e8() view returns (uint256)"
]);

