# Bitget Paper Order Endpoint Plan

## Endpoint

- Method: `POST`
- Path: `/api/v2/spot/trade/place-order`
- Scope: Bitget V2 spot single-order placement in paper/demo mode.

## Required Headers

- `Content-Type: application/json`
- `Accept: application/json`
- `locale: en-US`
- `ACCESS-KEY`
- `ACCESS-SIGN`
- `ACCESS-PASSPHRASE`
- `ACCESS-TIMESTAMP`
- `paptrading: 1`

Paper/demo REST requests must include `paptrading: 1`.

## Required Body Fields

For a spot market order:

- `symbol`
- `side`
- `orderType`
- `size`

For a spot limit order:

- `symbol`
- `side`
- `orderType`
- `size`
- `price`

## Market Buy Semantics

For raw Bitget REST spot market buys, `size` means quote coin amount, for example USDT on `BTCUSDT`.

This differs from some higher-level SDK/helper abstractions that may accept or compute base-asset quantity before constructing the exchange request.

## Limit Order Force Behavior

For limit orders, use `force: "gtc"` when a time-in-force value is needed or not otherwise specified.

Local Bitget client code maps this as `force`, not `timeInForce`.

## clientOid

`clientOid` support for spot place-order is likely because local Bitget client code forwards arbitrary order fields, but explicit local documentation for spot place-order `clientOid` was not found.

Treat `clientOid` as unconfirmed until verified against official docs or a controlled paper-mode test.

## Response Shape

Expected Bitget response envelope:

- `code`
- `msg` or `message`
- `data`

Success code:

- `00000`

Exact `data` fields for spot order placement are not confirmed by local docs.

## Demo Requirements

- Use a Bitget Demo API key created in Demo Trading mode.
- Include `paptrading: 1` on direct REST paper/demo requests.
- Keep paper mode explicitly gated by env flags:
  - `BITGET_MODE=paper`
  - `BITGET_PAPER_TRADING=true`
  - `AGENTGUARD_ALLOW_PAPER_TRADING=true`
- Do not mix demo keys and live keys.
- Do not enable live trading in Phase 5F.

## Unknowns

- Exact official required body schema beyond local examples.
- Exact order placement `data` response fields.
- Explicit official `clientOid` support for spot place-order.
- Whether all live spot order fields are accepted unchanged in paper/demo mode.
- Whether market buy quote-size behavior should be validated with a tiny paper order later before any automated execution path is enabled.

## Phase 5F-2 Recommendation

Build a safety-gated request builder/scaffold first.

The first implementation slice should:

- Construct and validate the paper spot order request payload.
- Add authenticated headers and `paptrading: 1`.
- Reuse existing paper env safety gates.
- Support mocked-fetch tests.
- Avoid order execution by default.

Actual paper order placement should remain behind a separate explicit user-confirmed demo command.
