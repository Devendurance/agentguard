# AgentGuard

Risk firewall for autonomous trading agents.

AgentGuard is a Bitget AI Hackathon Track 2 trading infrastructure project. It is an installable TypeScript SDK that sits between AI trading agents and Bitget-style execution clients, checking every order intent against deterministic risk policy before anything can reach execution.

## Problem

Autonomous trading agents can generate unsafe orders: oversized positions, excessive leverage, unsupported symbols, or trades during abnormal market regimes. LLM reasoning is useful for strategy, but it is not a reliable place to enforce hard risk controls.

Developers need infrastructure that makes risk rules deterministic, auditable, and impossible for an agent prompt to bypass.

## Solution

AgentGuard wraps an execution client with a policy engine. The agent can still generate trade intent, but AgentGuard decides whether the order is approved, resized, blocked, flattened, or paused before the execution layer receives it.

AgentGuard is published as an npm package, so developers can install it directly in their own trading-agent projects.

## How It Works

```text
AI agent
  -> OrderIntent
  -> AgentGuard policy check
  -> approve / resize / block / flatten / pause
  -> dry-run or demo execution adapter
  -> audit event log
```

AgentGuard currently supports:

- Policy loading and validation
- Deterministic risk evaluation
- Fail-closed behavior when risk state is unknown
- Market-risk rules from normalized market state
- Event logging for audit and dashboard data
- Bitget-shaped dry-run adapter
- Read-only Bitget public market data provider
- Optional read-only paper auth probe

## What Is Real Today

- SDK core works.
- Policy loading and validation work.
- Risk engine works.
- Event logging works.
- Bitget dry-run adapter works.
- Market-risk rules work.
- Bitget public read-only market data provider works.
- Trading agent integration demo works.
- Dashboard data generation works.
- SDK packaging still works for fallback or dev review.
- Paper read-only account probe is available as an optional credential check.
- Guarded paper order demo is available and safe by default.

No live trading is implemented. Paper order placement is not enabled by default.

## Quickstart

```bash
npm install @devendurance/agentguard-sdk
npm run demo:judge
```

`demo:judge` does not require private Bitget API keys. It runs the main trading-agent dry-run demo, regenerates dashboard sample data, and builds the SDK.

For exact reproducibility, you can pin the published version:

```bash
npm install @devendurance/agentguard-sdk@0.1.1
```

For fallback or dev review, the SDK pack command creates:

```text
agentguard-sdk-0.1.0.tgz
```

Install the published SDK in another project with:

```bash
npm install @devendurance/agentguard-sdk
```

## How Developers Use AgentGuard

1. Install/build the SDK

AgentGuard is now installable from npm on your own machine.

```bash
npm install @devendurance/agentguard-sdk
```

For exact reproducibility:

```bash
npm install @devendurance/agentguard-sdk@0.1.1
```

Local tarball install remains available for fallback or dev review:

```bash
npm run sdk:pack
npm install ./agentguard-sdk-0.1.0.tgz
```

2. Add a policy file

```json
{
  "mode": "active",
  "maxLeverage": 5,
  "maxOrderUsd": 250,
  "maxDailyDrawdownPct": 3,
  "allowedSymbols": ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
  "failClosed": true,
  "actions": {
    "onOrderTooLarge": "resize",
    "onDrawdownBreach": "flatten",
    "onUnknownRiskState": "block"
  },
  "marketRisk": {
    "enabled": true,
    "blockOnExtremeRegime": true,
    "blockOnExtremeSentiment": true,
    "maxVolatilityPct": 8,
    "maxFundingRateAbs": 0.05
  }
}
```

3. Wrap the trading agent's execution client

```ts
import {
  AgentGuard,
  BitgetPaperTradingClient,
  BitgetPublicMarketStateProvider,
  createAgentGuardedClient,
  loadPolicy
} from "@devendurance/agentguard-sdk";

const policy = await loadPolicy("./agentguard.policy.example.json");
const guard = new AgentGuard({ policy });

const marketProvider = new BitgetPublicMarketStateProvider();

const paperClient = new BitgetPaperTradingClient({
  maxPaperOrderUsd: 3
});

const accountState = {
  equityUsd: 10000,
  dailyPnlUsd: -100,
  dailyDrawdownPct: 1,
  totalDrawdownPct: 2,
  openExposureUsd: 500,
  symbolExposureUsd: {
    BTCUSDT: 200,
    ETHUSDT: 200,
    SOLUSDT: 100
  }
};

const guardedClient = createAgentGuardedClient(
  paperClient,
  guard,
  () => accountState,
  (order) => marketProvider.getMarketState(order)
);
```

4. Send agent-generated orders through AgentGuard

```ts
const agentOrder = {
  symbol: "BTCUSDT",
  side: "buy",
  orderType: "market",
  notionalUsd: 3,
  leverage: 2
};

const result = await guardedClient.placeOrder(agentOrder);

console.log(result.decision);
console.log(result.forwarded);
console.log(result.executionResult);
```

5. Explain decisions

- `approve`: order is within policy and can reach the adapter
- `resize`: oversized order is reduced to `maxOrderUsd` before forwarding
- `block`: unsafe order never reaches execution
- `pause`: policy mode can halt forwarding
- `flatten`: AgentGuard can emit a flatten decision on drawdown breach, but exchange-level position closing is intentionally not implemented yet

6. Explain execution safety

- dry-run is safe by default
- Bitget paper/demo trading only
- judge demo does not require private keys
- live trading is not implemented
- paper execution demos use Bitget Demo credentials
- blocked orders never reach execution

## Implemented Guard Actions

- `approve`: built and tested
- `resize`: built and tested with oversized SOLUSDT `$800` resized to `$250`
- `block`: built and tested with overleveraged ETH and unsupported DOGE
- `pause`: built as policy mode decision; paused mode prevents forwarding
- `flatten`: built as deterministic policy decision/audit event for drawdown breach; exchange-level close/flatten execution is not implemented yet

## Package Status

AgentGuard is published to npm.
For fallback or dev review, the SDK is still packable locally:

```bash
npm run sdk:pack
npm install ./agentguard-sdk-0.1.0.tgz
```

Primary npm install:

```bash
npm install @devendurance/agentguard-sdk
```

Pinned npm install:

```bash
npm install @devendurance/agentguard-sdk@0.1.1
```

## Optional Paper Auth

```bash
npm run demo:paper-auth
```

This optional probe requires Bitget Demo API keys. It calls a read-only paper account endpoint with `paptrading: 1`, prints only safe metadata, and does not place orders.

## Optional Guarded Paper Order

```bash
npm run demo:paper-order-guarded
```

The judge demo runs without private keys. This paper execution proof command uses Bitget Demo credentials and shows a safe `BTCUSDT` 3 USDT market buy reaching the paper client safety boundary, while an unsafe `ETHUSDT` 20x order is blocked before execution.

If Bitget returns `43012 Insufficient balance`, the signed request still reached the Bitget demo endpoint; fund the demo spot account with paper USDT or lower the size if allowed.

Resize paper proof:

```bash
npm run demo:paper-resize-guarded
```

The judge demo runs without private keys. This paper execution proof command uses Bitget Demo credentials and shows an oversized `SOLUSDT` market buy being resized from `$8` to `$3`, then written to `data/agentguard-paper-order-records.json` for `/dashboard`.

## Safety Guarantees

- Judge demo does not require private keys.
- Dry-run execution does not send Bitget orders.
- Blocked orders do not reach execution.
- Bitget paper/demo trading only.
- Paper execution demos use Bitget Demo credentials.
- Live trading is not implemented.
- `/dashboard` shows appended verifiable usage records, including resize records.
- Secrets are not printed by paper auth diagnostics.
- `.env` files should never be committed.

## Track 2 Relevance

AgentGuard is trading infrastructure, not a trading strategy. It gives AI trading developers a reusable middleware layer for policy enforcement, exchange adapter safety, audit logs, dashboard evidence, and future paper/live execution gates.

The core value is preventing unsafe autonomous execution before it reaches Bitget-style trading APIs.

The hosted dashboard displays committed verifiable usage records. New paper execution records are generated locally with npm run demo:paper-order-guarded and can be committed or viewed immediately in local dev.

