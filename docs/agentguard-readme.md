# AgentGuard

AgentGuard is an open-source risk firewall SDK for AI trading agents, enforcing deterministic execution policies before unsafe orders reach Bitget-style trading APIs.

Built for Bitget AI Hackathon — Track 2: Trading Infrastructure

## Why AgentGuard exists

AI trading agents can hallucinate, over-leverage, oversize positions, ignore drawdown, or keep trading during abnormal regimes. AgentGuard gives developers a hard policy layer before execution.

Let your AI agent think, but never let it execute outside your risk policy.

## What it does

- Intercepts order intents before execution
- Evaluates orders against a configurable risk policy
- Approves safe trades
- Resizes oversized trades
- Blocks unsafe trades
- Supports flat / pause style decisions
- Logs every decision as an auditable event
- Wraps any Bitget-shaped execution client

## Current MVP status

This MVP currently uses a local mock Bitget-shaped execution client to prove the middleware and policy engine safely.

- No real API keys are required.
- No live trades are placed.
- The execution client abstraction is designed so Bitget Agent Hub, Bitget MCP, or a real Bitget API client can be plugged in next.

## Quickstart

```bash
cd agentguard
npm install
npm run demo:basic
```

If dependencies are already installed, `npm install` may not be needed.

## Demo output

The basic-wrapper demo runs 4 scenarios:

1. BTCUSDT buy $180 3x ? approve ? forwarded
2. SOLUSDT buy $800 4x ? resize to $250 ? forwarded
3. ETHUSDT buy $200 20x ? block ? max_leverage_exceeded
4. DOGEUSDT buy $100 2x ? block ? symbol_not_allowed

The event log records all 4 decisions with timestamps, actions, and reasons.

## Policy example

```json
{
  "mode": "active",
  "maxLeverage": 5,
  "maxOrderUsd": 250,
  "maxDailyDrawdownPct": 3,
  "allowedSymbols": ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
  "failClosed": true,
  "actions": {
    "onOversizedOrder": "resize",
    "onDrawdownBreach": "flatten",
    "onUnknownRiskState": "block"
  }
}
```

## SDK usage

```typescript
import {
  AgentGuard,
  createAgentGuardedClient,
  loadPolicy
} from "./packages/sdk/src";

const policy = await loadPolicy("./agentguard.policy.example.json");
const guard = new AgentGuard({ policy });

const guardedBitget = createAgentGuardedClient(
  bitgetClient,
  guard,
  () => accountState,
  (order) => marketState
);

await guardedBitget.placeOrder(order);
```

## Architecture

```
AI Agent
  ? Order Intent
  ? AgentGuard
  ? Policy Engine
  ? approve / resize / block / flatten / pause
  ? Execution Client if allowed
  ? Event Log
```

## Project structure

```
agentguard/
  packages/sdk/src/
    types.ts
    policy.ts
    risk-engine.ts
    event-logger.ts
    guard.ts
    bitget-wrapper.ts
    index.ts
  examples/basic-wrapper/
    index.ts
  agentguard.policy.example.json
  package.json
  tsconfig.json
  README.md
```

## Why this is Track 2 infrastructure

AgentGuard is not a trading strategy. It is reusable infrastructure that other AI trading agent developers can wrap around their own execution flows with low friction.

## Next integrations

- Bitget Agent Hub execution adapter
- Bitget MCP adapter
- Bitget Skill Hub sentiment-analyst market risk input
- Bitget Skill Hub technical-analysis volatility input
- Replay simulator
- Next.js + Tailwind dashboard for event visualization

## Safety note

The current demo does not place live trades. Use testnet, sandbox, or mock execution until policies and integration are fully audited.
