## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## CipherPerps (contracts)

Minimal MVP contract layout:

- **`src/PositionManager.sol`**: user collateral + per-user position storage (1 position/user).
- **`src/TradingEngine.sol`**: simple PnL computation (placeholder math).
- **`src/PriceOracle.sol`**: Chainlink feed adapter returning a normalized 1e8 price.
- **`src/LiquidationEngine.sol`**: maintenance-margin liquidation gate + liquidation entrypoint.
- **`src/MockUSDC.sol`**: simple 6-decimal ERC20 used as collateral for local dev/tests.
- **`src/interfaces/IChainlinkAggregatorV3.sol`**: Chainlink AggregatorV3 interface.
- **`src/fhe/FheTypes.sol`**: placeholder `euint256` type until Zama FHE integration.
- **`src/mocks/MockAggregatorV3.sol`**: local test mock for Chainlink feed.
- **`script/DeployCipherPerps.s.sol`**: deploy script wiring the system.
- **`test/CipherPerps.t.sol`**: starter tests (open/close + liquidatability signal).

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
