# Bitget Paper Order Safety

This document describes the minimal guarded paper-order demo for AgentGuard.

## Scope

- Endpoint: `POST /api/v2/spot/trade/place-order`
- Mode: Bitget paper/demo trading only
- Header: `paptrading: 1`
- Order type: spot market buy only
- Symbol: `BTCUSDT` only
- Max order size: `3` USDT

For raw Bitget REST spot market buys, `size` is the quote coin amount. For `BTCUSDT`, `size: "3"` means a 3 USDT market buy.

## Default Safety Behavior

No order is sent by default.

The paper client returns:

```text
paper_order_not_sent_safety_gate
```

unless this flag is explicitly set:

```bash
AGENTGUARD_EXECUTE_PAPER_ORDER=true
```

## Required Paper Preconditions

Paper order execution requires all existing paper preflight checks:

```bash
BITGET_MODE=paper
BITGET_PAPER_TRADING=true
AGENTGUARD_ALLOW_PAPER_TRADING=true
```

It also requires Bitget Demo API credentials:

```bash
BITGET_API_KEY
BITGET_SECRET_KEY or BITGET_API_SECRET
BITGET_PASSPHRASE
```

The client refuses to send if:

```bash
AGENTGUARD_ALLOW_LIVE_TRADING=true
```

## Demo Command

```bash
npm run demo:paper-order-guarded
```

Default run proves:

- AgentGuard approves a safe `BTCUSDT` market buy intent.
- The safe order reaches the paper client.
- The paper client does not send the order because the execution gate is closed.
- AgentGuard blocks an unsafe `ETHUSDT` order before it reaches the paper client.

## Intentional Paper Execution

Only run this with Bitget Demo API keys, paper flags, and a deliberate decision to place a tiny paper order:

```bash
AGENTGUARD_EXECUTE_PAPER_ORDER=true npm run demo:paper-order-guarded
```

On Windows PowerShell:

```powershell
$env:AGENTGUARD_EXECUTE_PAPER_ORDER="true"
npm run demo:paper-order-guarded
```

## Observed Paper Endpoint Result

With `AGENTGUARD_EXECUTE_PAPER_ORDER=true`, the guarded `BTCUSDT` 3 USDT paper order reached the Bitget paper endpoint and Bitget returned:

```text
code: 43012
msg: Insufficient balance
```

This is still useful evidence: the request was signed, included `paptrading: 1`, passed the AgentGuard policy gate, passed the paper execution gate, and reached Bitget demo trading. The account simply did not have enough paper spot USDT for the order to fill.

To get a full successful/fill response, fund the Bitget demo spot account with paper USDT or lower the size if allowed by the demo safety limits. The unsafe `ETHUSDT` 20x order remains blocked by AgentGuard before execution and never reaches the paper client.

## Explicit Non-Goals

This demo does not implement:

- Live trading
- Order cancel
- Position close
- Leverage changes
- Transfers
- Withdrawals
- General-purpose paper trading

The only optional mutating endpoint is the gated paper/demo `place-order` request.
