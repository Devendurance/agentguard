# AgentGuard Submission Checklist

## Working Demos

- [ ] `npm install`
- [ ] `npm run demo:judge`
- [ ] `npm run demo`
- [ ] `npm run demo:dashboard-data`
- [ ] `npm run sdk:build`
- [ ] `npx tsc --noEmit --project tsconfig.agentguard.json`

## SDK Packaging

- [ ] `packages/sdk/package.json` exists for `@agentguard/sdk`.
- [ ] `packages/sdk/tsconfig.json` emits `dist`.
- [ ] `packages/sdk/README.md` explains install and usage.
- [ ] `npm run sdk:pack` creates `agentguard-sdk-0.1.0.tgz`.

## Dashboard

- [ ] `/dashboard` route exists.
- [ ] Dashboard reads `data/agentguard-dashboard-sample.json`.
- [ ] `npm run demo:dashboard-data` refreshes sample metrics and events.

## Safety

- [ ] No secrets committed.
- [ ] `.env` is not staged.
- [ ] No live trading implementation is enabled.
- [ ] Judge demo does not require private API keys.
- [ ] Dry-run adapter is used for execution demos.
- [ ] No order, cancel, transfer, withdraw, leverage, or close endpoint is called by judge demo.

## Optional Paper Auth

- [ ] `npm run demo:paper-auth` is documented as optional.
- [ ] Paper auth requires Bitget Demo API keys.
- [ ] Paper auth requires paper env flags.
- [ ] Paper auth is read-only and does not place orders.
