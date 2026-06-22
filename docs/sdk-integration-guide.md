# AgentGuard SDK Integration Guide

AgentGuard is published as an npm package, so developers can install it directly in their own trading-agent projects.

---

## Judge Quickstart

```bash
npm install @devendurance/agentguard-sdk
npm run demo:judge
```

For exact reproducibility:

```bash
npm install @devendurance/agentguard-sdk@0.1.1
```

For fallback or dev review, you can still pack locally:

```bash
npm run sdk:pack
npm install ./agentguard-sdk-0.1.0.tgz
```

`demo:judge` does not require private Bitget API keys. It runs the trading-agent dry-run demo, regenerates sample dashboard data, and builds the SDK package.

Paper authentication is optional:

```bash
npm run demo:paper-auth
```

The paper auth probe requires Bitget Demo API keys. It is read-only and does not place orders.

---

## 1. Install / Setup

### Install from npm

```bash
npm install @devendurance/agentguard-sdk
```

For exact reproducibility:

```bash
npm install @devendurance/agentguard-sdk@0.1.1
```

For fallback or dev review, you can still pack locally with `npm run sdk:pack` and install `./agentguard-sdk-0.1.0.tgz`.

## 2. Minimal Integration

```typescript
import {
  AgentGuard,
  createAgentGuardedClient,
  loadPolicy,
  BitgetMcpAdapter,
  BitgetPublicMarketStateProvider,
  OrderIntent,
  AccountState,
} from "@devendurance/agentguard-sdk";

const policy = await loadPolicy("./agentguard.policy.example.json");
const guard = new AgentGuard({ policy });
const marketProvider = new BitgetPublicMarketStateProvider();
const executionClient = new BitgetMcpAdapter({ mode: "dry_run" });

const getAccountState = (): AccountState => ({
  equityUsd: 10000,
  dailyPnlUsd: -100,
  dailyDrawdownPct: 1,
  totalDrawdownPct: 2,
  openExposureUsd: 500,
});

const guardedBitget = createAgentGuardedClient(
  executionClient,
  guard,
  getAccountState,
  (order) => marketProvider.getMarketState(order)
);

const agentOrder: OrderIntent = {
  symbol: "BTCUSDT",
  side: "buy",
  orderType: "market",
  notionalUsd: 180,
  leverage: 3,
};

const result = await guardedBitget.placeOrder(agentOrder);

console.log(`Decision: ${result.decision.action}`);
console.log(`Reason: ${result.decision.reason}`);
console.log(`Forwarded: ${result.forwarded}`);
```

---

## 3. Mental Model

```
+-----------------+
| Trading Agent   |
| (LLM/strategy)  |
+-----------------+
         | generates OrderIntent
         v
+-----------------+
| AgentGuard      |
| - Load policy   |
| - Check rules   |
| - Evaluate risk |
+-----------------+
         | approve/resize/block
         v
+-----------------+
| Execution       |
| (BitgetMcpAdapter) |
| - dry_run: log  |
| - paper: demo   |
| - live: not impl|
+-----------------+
```

**Key principles:**

1. **Agent creates intent** - Your trading agent or LLM generates `OrderIntent` based on strategy, signals, or user input.
2. **AgentGuard checks policy** - Before any execution, AgentGuard evaluates the order against your risk policy.
3. **Market provider supplies risk state** - `BitgetPublicMarketStateProvider` fetches public market data to inform risk decisions.
4. **Execution adapter only receives allowed orders** - Only `approve` or `resize` decisions reach the execution layer. `block` decisions stop execution entirely.
5. **Every decision is logged** - AgentGuard records all evaluations in an event log for audit and replay.

---

## 4. Safety Modes

### dry_run (default, recommended for development)

```typescript
const adapter = new BitgetMcpAdapter({ mode: "dry_run" });
```

- Orders are validated and shaped but never sent to Bitget
- Adapter logs the would-be payload and returns `dry_run_not_sent`
- Safe for testing, development, and demos
- No credentials required

### paper (Bitget Demo trading only)

```typescript
const adapter = new BitgetMcpAdapter({ mode: "paper" });
```

- Orders are sent to the Bitget Demo Trading environment
- Uses virtual funds with real market data
- Requires Bitget Demo API Key credentials
- Safe for strategy testing without real capital at risk

### live (not implemented)

```typescript
const adapter = new BitgetMcpAdapter({ mode: "live" });
```

- Live trading is not implemented
- Bitget paper/demo trading only
- Blocked orders never reach execution

AgentGuard is designed to fail closed when required account or market state is missing and `failClosed` is enabled.

---

## 5. What Is Real Today

- SDK policy loading, validation, risk decisions, guarded wrapping, and event logging work.
- Real Bitget public market data works through the read-only public market provider.
- Paper read-only auth probing works with Bitget demo credentials and `paptrading: 1`.
- Execution is dry-run by default.
- Paper execution demos use Bitget Demo credentials.
- Paper/demo execution is available through explicit demo commands.
- No live trading implementation is included.
- Blocked orders never reach execution.

---

## 6. Demo Commands

Run these demos to see AgentGuard in action:

```bash
npm run demo:basic
npm run demo:bitget-dry-run
npm run demo:market-risk
npm run demo:skill-hub-state
npm run demo:dashboard-data
npm run demo:bitget-public-market
npm run demo:trading-agent-integration
npm run demo:bitget-auth-preflight
npm run demo:bitget-env-doctor
npm run demo:bitget-paper-connectivity
npm run demo:paper-auth
```

Use the paper account probe only with Bitget Demo API credentials. Do not use live keys for paper testing.

