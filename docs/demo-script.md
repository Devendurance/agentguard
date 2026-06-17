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
