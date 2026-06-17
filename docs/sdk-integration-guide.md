# AgentGuard SDK Integration Guide

This guide shows how to integrate AgentGuard into a trading agent or AI system.

> **Note:** This repo is currently local development. Future releases will be published as an npm package.

---

## Judge Quickstart

```bash
npm install
npm run demo:judge
npm run sdk:pack
```

`demo:judge` does not require private Bitget API keys. It runs the trading-agent dry-run demo, regenerates sample dashboard data, and builds the SDK package.

Paper authentication is optional:

```bash
npm run demo:paper-auth
```

The paper auth probe requires Bitget Demo API keys and all paper env flags. It is read-only and does not place orders.

---

## 1. Install / Setup

### Local development (current)

```bash
# Clone the repo
git clone <repo-url>
cd BitgetAI-Hackathon

# Install dependencies
npm install

# Run demos
npm run demo
```

### Future npm package style (planned)

```bash
# When published to npm
npm install @agentguard/sdk

# In your code
import { AgentGuard, createAgentGuardedClient } from "@agentguard/sdk";
```

---

## 2. Minimal Integration

Here is the smallest working integration:

```typescript
import {
  AgentGuard,
  createAgentGuardedClient,
  loadPolicy,
  BitgetMcpAdapter,
  BitgetPublicMarketStateProvider,
  OrderIntent,
  AccountState,
} from "../packages/sdk/src";

// 1. Load your risk policy
const policy = await loadPolicy("./agentguard.policy.example.json");
const guard = new AgentGuard({ policy });

// 2. Create market state provider (real public data)
const marketProvider = new BitgetPublicMarketStateProvider();

// 3. Create execution client (dry-run by default)
const executionClient = new BitgetMcpAdapter({ mode: "dry_run" });

// 4. Create your account state provider
const getAccountState = (): AccountState => ({
  equityUsd: 10000,
  dailyPnlUsd: -100,
  dailyDrawdownPct: 1,
  totalDrawdownPct: 2,
  openExposureUsd: 500,
});

// 5. Wrap execution with AgentGuard
const guardedBitget = createAgentGuardedClient(
  executionClient,
  guard,
  getAccountState,
  (order) => marketProvider.getMarketState(order)
);

// 6. Your agent generates an order intent
const agentOrder: OrderIntent = {
  symbol: "BTCUSDT",
  side: "buy",
  orderType: "market",
  notionalUsd: 180,
  leverage: 3,
};

// 7. Submit through guarded client
const result = await guardedBitget.placeOrder(agentOrder);

// 8. Check the result
console.log(`Decision: ${result.decision.action}`); // approve | resize | block
console.log(`Reason: ${result.decision.reason}`);
console.log(`Forwarded: ${result.forwarded}`);
```

---

## 3. Mental Model

```
+-----------------+
¦ Trading Agent   ¦
¦ (LLM/strategy)  ¦
+-----------------+
         ¦ generates OrderIntent
         ?
+-----------------+
¦ AgentGuard      ¦
¦ • Load policy   ¦
¦ • Check rules   ¦
¦ • Evaluate risk ¦
+-----------------+
         ¦ approve/resize/block
         ?
+-----------------+
¦ Execution       ¦
¦ (BitgetMcpAdapter)¦
¦ • dry_run: log  ¦
¦ • paper: sandbox¦
¦ • live: trade   ¦
+-----------------+
```

**Key principles:**

1. **Agent creates intent** — Your trading agent/LLM generates `OrderIntent` based on strategy, signals, or user input.

2. **AgentGuard checks policy** — Before any execution, AgentGuard evaluates the order against your risk policy:
   - Max position size
   - Max leverage
   - Daily loss limits
   - Symbol allowlist
   - Market-risk conditions (if enabled)

3. **Market provider supplies risk state** — `BitgetPublicMarketStateProvider` fetches real public market data (ticker, funding rate, candles) to inform risk decisions.

4. **Execution adapter only receives allowed orders** — Only `approve` or `resize` decisions reach the execution layer. `block` decisions stop execution entirely.

5. **Every decision is logged** — AgentGuard records all evaluations in an event log for audit, replay, and dashboard visualization.

---

## 4. Safety Modes

### dry_run (default, recommended for development)

```typescript
const adapter = new BitgetMcpAdapter({ mode: "dry_run" });
```

- Orders are validated and shaped but never sent to Bitget
- Adapter logs the would-be payload and returns `dry_run_not_sent`
- Safe for testing, development, and demos
- **No credentials required**

### paper (planned, requires demo credentials)

```typescript
// Future implementation
const adapter = new BitgetMcpAdapter({ mode: "paper" });
```

- Orders are sent to Bitget Demo Trading environment
- Uses virtual funds, real market data
- Requires Bitget Demo API Key credentials
- Safe for strategy testing without real capital at risk

### live (planned, requires explicit opt-in)

```typescript
// Future implementation - requires env var
// AGENTGUARD_ALLOW_LIVE_TRADING=true
const adapter = new BitgetMcpAdapter({ mode: "live" });
```

- Orders are sent to live Bitget exchange
- **Requires explicit developer opt-in via environment variable**
- **Requires valid Bitget API credentials**
- **All write operations require user confirmation in agent workflow**

> **Safety gate:** Live mode will never be enabled by default. The `AGENTGUARD_ALLOW_LIVE_TRADING` environment variable must be explicitly set, and the adapter will verify this before allowing any write operations.

---

## 5. What Is Real Today

| Component | Status | Notes |
|-----------|--------|-------|
| **SDK risk firewall** | ? Production-ready | Policy engine, decision logic, event logging all work |
| **Bitget public market data** | ? Live | `BitgetPublicMarketStateProvider` fetches real public APIs (ticker, funding, candles) |
| **Bitget execution adapter** | ?? Dry-run only | `BitgetMcpAdapter` shapes orders but does not send them; `dry_run` mode only |
| **Paper trading** | ?? Planned | Requires Bitget Demo API Key setup |
| **Live trading** | ?? Planned | Requires explicit opt-in + credentials + confirmation workflow |

**What works now:**
- AgentGuard evaluates orders against policy before execution
- Real market data from Bitget public APIs informs risk decisions
- Approved/resized orders are shaped for Bitget API (dry-run)
- Blocked orders never reach execution layer
- Full audit log of all decisions

**What does not work yet:**
- No actual order placement on Bitget (dry-run only)
- No paper trading mode (planned)
- No live trading mode (planned, requires explicit opt-in)

---

## 6. Demo Commands

Run these demos to see AgentGuard in action:

```bash
# Main trading agent integration demo (recommended start)
npm run demo

# Basic wrapper demo (simple policy evaluation)
npm run demo:basic

# Bitget dry-run adapter demo (execution shaping)
npm run demo:bitget-dry-run

# Market-risk policy demo (volatility/funding conditions)
npm run demo:market-risk

# Skill Hub state provider demo (mock market data)
npm run demo:skill-hub-state

# Dashboard data foundation demo (metrics export)
npm run demo:dashboard-data

# Bitget public market data demo (real APIs)
npm run demo:bitget-public-market

```

---

## 7. Troubleshooting

### API rate limits
Bitget public endpoints have a 20 req/s rate limit. The provider handles this gracefully with fallback behavior.

### Network errors
If `fallbackOnError: true` (default), network errors return a safe fallback `MarketState` with `source: "fallback"` instead of crashing.

### Policy not loading
Ensure `agentguard.policy.example.json` exists in your working directory or provide the correct path to `loadPolicy()`.

### TypeScript errors
Use the project config:
```bash
npx tsc --noEmit --project tsconfig.agentguard.json
```

---

## 8. Next Steps

1. **Test with your agent** — Replace the mock `generateAgentOrder()` with your actual trading agent/LLM.

2. **Customize policy** — Edit `agentguard.policy.example.json` to match your risk tolerance.

3. **Add logging** — Subscribe to `guard.getEvents()` for real-time decision monitoring.

4. **Integrate dashboard** — Use `buildDashboardDataset()` to export decisions for visualization.

5. **Plan for paper/live** — When ready, follow Bitget's Demo API Key setup for paper trading, then implement the live mode opt-in workflow.

---

> **Security reminder:** Never commit API keys or credentials to version control. Use environment variables and secret management for production deployments.

