# AgentGuard Demo Script

## 2-Minute Demo Flow

1. Introduce AgentGuard as a risk firewall SDK for autonomous trading agents.
2. Run the judge demo.
3. Point out approved, resized, and blocked decisions.
4. Show that blocked orders never reach execution.
5. Open `/dashboard` as the audit viewer for sample decisions and the paper-order usage record.
6. Mention SDK packaging.

## Commands

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

Optional read-only paper authentication check:

```bash
npm run demo:paper-auth
```

Paper execution proof demo:

```bash
npm run demo:paper-order-guarded
```

Resize paper execution proof demo:

```bash
npm run demo:paper-resize-guarded
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

- The SDK can be packaged for local fallback or dev review.
- Judges or developers can install the generated tarball locally.

`npm run demo:paper-auth` proves, when credentials are available:

- Bitget Demo credentials can be checked safely.
- `paptrading: 1` is included.
- The probe is read-only and does not place orders.

`npm run demo:paper-order-guarded` proves:

- The judge demo runs without private keys.
- Paper execution demos use Bitget Demo credentials.
- AgentGuard approves the safe `BTCUSDT` 3 USDT market buy intent.
- AgentGuard blocks the unsafe `ETHUSDT` 200 USDT 20x order before it reaches execution.
- A sanitized verifiable usage record is written to `data/agentguard-paper-order-record.json`.
- The command shows a paper/demo execution proof path separate from the no-key judge demo.

`npm run demo:paper-resize-guarded` proves:

- AgentGuard resizes the oversized `SOLUSDT` 8 USDT market buy intent down to 3 USDT.
- Paper execution demos use Bitget Demo credentials.
- A sanitized verifiable usage record is appended to `data/agentguard-paper-order-records.json`.
- `/dashboard` can show the new resize usage record after refresh.
- The command shows a paper/demo execution proof path separate from the no-key judge demo.

## Dashboard Mention

The dashboard is available at `/dashboard` in the Next.js app and reads generated sample data from `data/agentguard-dashboard-sample.json`.

It also reads the append-only `data/agentguard-paper-order-records.json` file when present and displays it in the "Verifiable Usage Records" section as an audit viewer. Refreshing `/dashboard` reloads the saved local records, including resize records.

Use `npm run demo:dashboard-data` directly if you only want to refresh dashboard data.

## SDK Install/Pack Mention

The SDK is published on npm, and local packing remains available for fallback or dev review:

```bash
npm install @devendurance/agentguard-sdk
npm install @devendurance/agentguard-sdk@0.1.1
npm run sdk:pack
npm install ./agentguard-sdk-0.1.0.tgz
```

This shows AgentGuard is reusable infrastructure rather than only an app demo.

