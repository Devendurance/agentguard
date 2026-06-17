# AgentGuard Demo Script

## 2-Minute Demo Flow

1. Introduce AgentGuard as a risk firewall SDK for autonomous trading agents.
2. Run the judge demo.
3. Point out approved, resized, and blocked decisions.
4. Show that blocked orders never reach execution.
5. Mention dashboard sample data and SDK packaging.

## Commands

```bash
npm install
npm run demo:judge
npm run sdk:pack
```

Optional read-only paper authentication check:

```bash
npm run demo:paper-auth
```

Guarded paper order demo, safe by default:

```bash
npm run demo:paper-order-guarded
```

Optional intentional paper execution:

```bash
AGENTGUARD_EXECUTE_PAPER_ORDER=true npm run demo:paper-order-guarded
```

## What The Output Proves

`npm run demo:judge` proves:

- A trading agent can generate multiple order intents.
- AgentGuard evaluates each intent before execution.
- Safe orders are approved.
- Oversized orders can be resized.
- Overleveraged or unsupported-symbol orders are blocked.
- The Bitget adapter runs in dry-run mode.
- No private order endpoint is called.
- Dashboard sample data can be regenerated.
- The SDK builds successfully.

`npm run sdk:pack` proves:

- The SDK can be packaged as `@agentguard/sdk`.
- Judges or developers can install the generated tarball locally.

`npm run demo:paper-auth` proves, when credentials are available:

- Bitget Demo credentials can be checked safely.
- `paptrading: 1` is included.
- The probe is read-only and does not place orders.

`npm run demo:paper-order-guarded` proves:

- The default run sends no order.
- AgentGuard approves the safe `BTCUSDT` 3 USDT market buy intent.
- The paper client refuses to send unless `AGENTGUARD_EXECUTE_PAPER_ORDER=true`.
- AgentGuard blocks the unsafe `ETHUSDT` 200 USDT 20x order before it reaches the paper client.
- If intentional execution returns Bitget `43012 Insufficient balance`, the signed paper order request still reached the Bitget demo endpoint; the demo spot account needs paper USDT or a lower allowed size for a full fill.

## Dashboard Mention

The dashboard is available at `/dashboard` in the Next.js app and reads generated sample data from `data/agentguard-dashboard-sample.json`.

Use `npm run demo:dashboard-data` directly if you only want to refresh dashboard data.

## SDK Install/Pack Mention

The SDK lives in `packages/sdk` and is packable:

```bash
npm run sdk:pack
npm install ./agentguard-sdk-0.1.0.tgz
```

This shows AgentGuard is reusable infrastructure rather than only an app demo.
