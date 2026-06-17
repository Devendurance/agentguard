# Verifiable Usage Record

AgentGuard writes a sanitized paper-order usage record when the guarded paper order demo runs:

```bash
npm run demo:paper-order-guarded
```

The record is written to:

```text
data/agentguard-paper-order-record.json
```

## What The Record Shows

The safe order intent is a `BTCUSDT` market buy for 3 USDT at 2x leverage. AgentGuard evaluates the intent first. In the default run, the order reaches the paper client scaffold but is not sent because `AGENTGUARD_EXECUTE_PAPER_ORDER=true` is not set.

Intentional paper execution is opt-in:

```bash
AGENTGUARD_EXECUTE_PAPER_ORDER=true npm run demo:paper-order-guarded
```

When the opt-in execution was run with Bitget Demo credentials, Bitget returned `code: 00000`, `msg: success`, plus an `orderId` and `clientOid`. The demo records only sanitized response fields.

The unsafe order intent is an `ETHUSDT` market buy for 200 USDT at 20x leverage. AgentGuard blocks it before execution, so it never reaches the paper client.

## Dashboard Viewer

The `/dashboard` route reads `data/agentguard-paper-order-record.json` when it exists and displays it in the "Verifiable Usage Record" section.

The dashboard shows:

- Record generation time.
- Approved BTC order intent and AgentGuard decision.
- Sanitized Bitget paper response fields: `code`, `msg`, `orderId`, and `clientOid`.
- Blocked ETH order intent and AgentGuard reason.
- Safety notes.

## Safety

The JSON record does not include API keys, signatures, passphrases, request headers, or raw secrets. AgentGuard does not implement live trading, and the guarded paper demo does not call cancel, close, leverage, transfer, or withdraw endpoints.
