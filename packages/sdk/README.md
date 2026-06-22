# AgentGuard SDK

AgentGuard is a risk firewall and middleware SDK for AI trading agents. It wraps a trading or execution client, evaluates each order intent against deterministic policy rules, and only forwards approved or resized orders.

It is built for Bitget-style trading infrastructure demos where model-generated trade intent must pass through a hard safety boundary before execution.

## Install From npm

From the repository root:

```bash
npm install @devendurance/agentguard-sdk
```

For exact reproducibility:

```bash
npm install @devendurance/agentguard-sdk@0.1.1
```

For local development in this repo, you can also import directly from `packages/sdk/src`.

## Judge Quickstart

From the repository root:

```bash
npm install @devendurance/agentguard-sdk
npm run demo:judge
```

`demo:judge` does not require private Bitget API keys. It runs the trading-agent dry-run demo, regenerates sample dashboard data, and builds the SDK package.

For exact reproducibility:

```bash
npm install @devendurance/agentguard-sdk@0.1.1
```

For fallback or dev review, you can still pack locally:

```bash
npm run sdk:pack
npm install ./agentguard-sdk-0.1.0.tgz
```

Paper authentication is optional:

```bash
npm run demo:paper-auth
```

The paper auth probe requires Bitget Demo API keys. It is read-only and does not place orders.

## Minimal Usage

```ts
import {
  AgentGuard,
  BitgetMcpAdapter,
  createAgentGuardedClient,
  type AccountState,
  type MarketState,
  type RiskPolicy,
} from "@devendurance/agentguard-sdk";

const policy: RiskPolicy = {
  mode: "active",
  maxLeverage: 5,
  maxOrderUsd: 250,
  maxDailyDrawdownPct: 3,
  allowedSymbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
  failClosed: true,
  actions: {
    onOversizedOrder: "resize",
    onDrawdownBreach: "flatten",
    onUnknownRiskState: "block",
  },
};

const guard = new AgentGuard({ policy });
const executionClient = new BitgetMcpAdapter({ mode: "dry_run" });

const accountStateProvider = async (): Promise<AccountState> => ({
  equityUsd: 1000,
  dailyPnlUsd: 0,
  dailyDrawdownPct: 0,
});

const marketStateProvider = async (): Promise<MarketState> => ({
  symbol: "BTCUSDT",
  riskRegime: "normal",
  sentiment: "neutral",
  source: "mock",
});

const guardedClient = createAgentGuardedClient(
  executionClient,
  guard,
  accountStateProvider,
  marketStateProvider
);

const result = await guardedClient.placeOrder({
  symbol: "BTCUSDT",
  side: "buy",
  orderType: "market",
  notionalUsd: 100,
  leverage: 2,
});

console.log(result.decision.action);
console.log(result.forwarded);
```

## Safety Modes

- `dry_run`: default demo execution mode. It returns Bitget-shaped payloads but does not send orders.
- `paper`: Bitget paper/demo trading only.
- `live`: live trading is not implemented.

AgentGuard is designed to fail closed when required account or market state is missing and `failClosed` is enabled.

## What Is Real Today

- SDK policy loading, validation, risk decisions, guarded wrapping, and event logging work.
- Real Bitget public market data works through the read-only public market provider.
- Paper read-only auth probing works with Bitget demo credentials and `paptrading: 1`.
- Execution is dry-run by default.
- Paper execution demos use Bitget Demo credentials.
- Paper/demo execution is available through explicit demo commands.
- No live trading implementation is included.

## Demo Commands

Run these from the repository root:

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

Use the paper account probe only with Bitget Demo API credentials and the required paper flags. Do not use live keys for paper testing.

