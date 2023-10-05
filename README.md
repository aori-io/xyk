# xyk: cfmm-replicating bots on Aori

## Table of Contents
- [Introduction](#introduction)
- [00: Test Connectivity](#00-test-connectivity)
- [01: One-For-One](#01-one-for-one)
- [02: Constant (Dynamic) Market Maker](#02-constant-dynamic-market-maker)
- [03: Constant Rate Market Maker](#03-constant-rate-market-maker)
- [04: Ascending Static Market Maker](#04-ascending-static-market-maker)
- [05: Constant Product Static Market Maker](#05-constant-product-static-market-maker)
- [06: Binomial Static Market Maker](#06-binomial-static-market-maker)
- [07: Log Market Scoring Rule](#07-log-market-scoring-rule)
- [08: Balancer Static Market Maker](#08-balancer-static-market-maker)


### Introduction

A number of bots are provided in this repository, emulating a number of market making strategies that exist on-chain currently via constant function market maker curves.

On-chain, there are a number of behaviours that can't be emulated due to the idempotency of smart contracts outside of user interactions, of which we will highlight several through these examples e.g
- FIFO Ordering
- Realtime Limit Order Rebalancing
- Ability to pull in external market data

Bots will have several attributes about them that either dictate the behaviour of:
- Their limit order placement (`rate` or just upon initialisation)
- Their limit order replacement (`static` if none, `dynamic` if recurring)
- Their limit order settlement (from their own inventory or by pulling in liquidity from an outside DEX)
- The relation between their limit orders (e.g constant, some CFMM curve, LMSR, Balancer Weighted Curve etc.)

### 00: Test Connectivity
_Added by [@hilliamt](https://github.com/hilliamt)_

```bash
$ ts-node 00-aori-ping
```

This bot can be used to test connectivity to the Aori API, calling `aori_ping`.

```
On Initialisation:
- Sends a `aori_ping` to the Aori API
```


### 01: One-For-One
_Added by [@hilliamt](https://github.com/hilliamt)_

```bash
$ ts-node 01-one-for-one
```

This bot will manage a simple limit order that trades 1 of `aTokenAddress` for 1 of `bTokenAddress` on chain `chainId`.

```
On Initialisation:
- Create a limit order (aTokenAddress, 1e18, bTokenAddress, 1e18, chainId)

On Order Taken:
- Recreate the same limit order

On Order-To-Be-Executed:
- Settles order on-chain
```

### 02: Constant (Dynamic) Market Maker
_Added by [@hilliamt](https://github.com/hilliamt)_

```bash
$ ts-node 02-constant-market-maker
```

This bot will manage a simple limit order that trades `aAmount` of `aTokenAddress` for `bAmount` of `bTokenAddress` on chain `chainId`.

```
On Initialisation:
- Create a limit order (aTokenAddress, aAmount, bTokenAddress, bAmount, chainId)

On Order Taken:
- Recreate the same limit order

On Order-To-Be-Executed:
- Settles order on-chain
```

### 03: Constant Rate Market Maker
_Added by [@hilliamt](https://github.com/hilliamt)_

```bash
$ ts-node 03-constant-rate-market-maker
```

This bot will manage a simple limit order that trades `aAmount` of `aTokenAddress` for `bAmount` of `bTokenAddress` on chain `chainId`. It will create a new limit order at the same price and quantity every hour.
```
On Initialisation:
- Create a limit order (aTokenAddress, aAmount, bTokenAddress, bAmount, chainId)

Every hour:
- Creates the same limit order, even if the last hasn't been completely fulfilled

On Order-To-Be-Executed:
- Settles order on-chain
```

### 04: Ascending Static Market Maker
_Added by [@hilliamt](https://github.com/hilliamt)_

```bash
$ ts-node 04-ascending-static-market-maker
```

This bot can be ran to emulate a simple concentrated liquidity
curve; it takes address and amount for input + output, then creates a series of sequential
orders that increment (or decrement) according to the value of percentageMultiplier.
If the first order was a 1:1 swap, an example continuation may also submit orders for 1:1.05 and 1:1.1
as well.

### 05: Constant Product Static Market Maker
_Added by [@50shadesofgwei](https://github.com/50shadesofgwei)_

```bash
$ ts-node 05-constant-product-static
```

TODO:

### 06: Binomial Static Market Maker
_Added by `@50shadesofgwei`_ and `@hilliamt`_

```bash
$ ts-node 06-binomial-static-market-maker
```

TODO:

### 07: Log Market Scoring Rule
_Added by `@50shadesofgwei`_

```bash
$ ts-node 07-log-market-scoring-rule
```

TODO:

### 08: Balancer Static Market Maker
_Added by `@50shadesofgwei`_

```bash
$ ts-node 08-balancer-static-market-maker
```

TODO: