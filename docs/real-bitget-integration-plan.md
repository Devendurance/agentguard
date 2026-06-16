# Real Bitget Integration Plan

## Discovery Summary

This document captures the findings from Phase 5A discovery for safe Bitget integration with AgentGuard.

---

## Local Tooling Found

### NPM Package
- `@bitget-ai/getagent-skill@^0.2.1` installed in project dependencies
- Provides CLI binary: `getagent-skill` (installer for AI client skills, not trading CLI)
- Located in `node_modules/.bin/getagent-skill`

### Codex Skills (Available via MCP)
| Skill | Purpose | MCP Server |
|-------|---------|-----------|
| `bitget-skill` | Full Bitget exchange operations (spot, futures, account, margin, etc.) | `bgc` CLI |
| `getagent` | GetAgent Playbook creation/backtesting | Python control-plane API |
| `sentiment-analyst` | Market sentiment, derivatives positioning, fear/greed | `datahub.noxiaohao.com/mcp` |
| `technical-analysis` | Technical indicators, chart patterns, price levels | Bitget kline API |
| `market-intel` | On-chain flows, institutional data, market cycles | Bitget market data |

### CLI Tool: `bgc`
- **Status**: Not in system PATH; requires installation via `npm install -g bitget-client`
- **Usage**: `bgc <module> <tool_name> [--param value ...]`
- **Output**: Always JSON with `data`, `endpoint`, `requestTime` fields

---

## Available Commands (by Safety Classification)

### A. Safe Read-Only (No Credentials Required)
**Spot Module:**
- `spot_get_ticker` — Real-time ticker data
- `spot_get_depth` — Orderbook depth
- `spot_get_candles` — K-line/candlestick data
- `spot_get_trades` — Recent trade history
- `spot_get_symbols` — Symbol/coin metadata

**Futures Module:**
- `futures_get_ticker` — Futures ticker data
- `futures_get_funding_rate` — Current funding rate + next settlement
- `futures_get_positions` — Public position info (no auth for public data)
- `futures_get_candles` — Futures candlestick data

**Account Module (Public):**
- None — all account endpoints require authentication

### B. Read-Only with Credentials (Account Queries)
**Account Module:**
- `get_account_assets` — Balances by coin
- `get_transfers` — Transfer history
- `get_subaccount_list` — Subaccount info

**Spot Module:**
- `spot_get_orders` — Query open/history orders
- `spot_get_user_trades` — User trade history

**Futures Module:**
- `futures_get_positions` — Current positions with PnL, liquidation price
- `futures_get_orders` — Futures order history
- `futures_get_fills` — Trade fills

### C. Write Operations (Require Confirmation + Credentials)
**Spot Module:**
- `spot_place_order` — Place spot order
- `spot_cancel_orders` — Cancel spot orders
- `spot_modify_order` — Modify (cancel+replace) order

**Futures Module:**
- `futures_place_order` — Place futures order
- `futures_cancel_orders` — Cancel futures orders
- `futures_set_leverage` — Change leverage
- `futures_close_position` — Close position

**Account Module:**
- `transfer` — Transfer between account types
- `withdraw` — Withdraw funds

---

## Paper/Sim Trading Support

**Available via `--paper-trading` flag**

### Setup Requirements
1. Create Demo API Key at https://www.bitget.com (Personal Center → API Key Management)
2. Set demo credentials as env vars:
   ```
   BITGET_API_KEY=<demo-key>
   BITGET_SECRET_KEY=<demo-secret>
   BITGET_PASSPHRASE=<demo-passphrase>
   ```
3. Add `--paper-trading` flag to ALL `bgc` commands in session

### CLI Usage
```bash
bgc --paper-trading spot spot_get_ticker --symbol BTCUSDT
bgc --paper-trading futures futures_get_positions --productType USDT-FUTURES
bgc --paper-trading account get_account_assets
```

### MCP Usage
Start MCP server with `--paper-trading` flag:
```bash
bitget-mcp --paper-trading --modules spot,futures,account
```

**Important**: Demo keys are completely separate from live keys. Never mix modes in same session.

---

## Required Environment Variables (Names Only)

| Variable | Purpose | Required For |
|----------|---------|-------------|
| `BITGET_API_KEY` | API key identifier | All private endpoints |
| `BITGET_SECRET_KEY` | Request signing secret | All private endpoints |
| `BITGET_PASSPHRASE` | API key passphrase | All private endpoints |
| `BITGET_BASE_URL` | Optional: custom API base URL | Advanced/proxy setups |
| `BITGET_MODE` | Optional: `live` or `demo` override | Mode selection |
| `AGENTGUARD_ALLOW_LIVE_TRADING` | AgentGuard safety gate | Enable live execution in AgentGuard |

**Note**: Values must never be printed, logged, or committed. Use environment injection only.

---

## Recommended Adapter Path for Phase 5B

### Primary Recommendation: Read-Only Market Data Probe

Build a minimal `BitgetReadOnlyAdapter` that:

1. **Uses public endpoints only** (no credentials required):
   - `spot_get_ticker` for price data
   - `futures_get_funding_rate` for funding data
   - `spot_get_candles` for volatility calculation

2. **Returns normalized `MarketState`** compatible with AgentGuard:
   ```typescript
   {
     symbol: string;
     fundingRate?: number;
     volatilityPct?: number;
     sentiment?: "neutral" | "extreme_fear" | "extreme_greed";
     riskRegime?: "normal" | "elevated" | "extreme";
     source: "bitget-public-api";
   }
   ```

3. **Fails safely**: If API unavailable, returns fallback `MarketState` with `source: "fallback"`

4. **Demo mode**: Can be toggled via `BITGET_MODE=demo` env var for testing

### Implementation Files (Proposed)
```
packages/sdk/src/providers/bitget-read-only-adapter.ts
examples/bitget-read-only-demo/index.ts
```

### Safety Gates
- No write operations (`spot_place_order`, etc.) in Phase 5B
- No credential handling in code — env vars only
- All API calls wrapped in try/catch with graceful degradation
- Rate limiting respected (20 req/s for public endpoints)

---

## Phase 5B Implementation Recommendation

### Step 1: Create `BitgetReadOnlyMarketStateProvider`
- Implements `MarketStateProvider` interface from Phase 3B
- Fetches: ticker price, 24h change, funding rate (futures), recent candles for volatility
- Calculates `volatilityPct` from recent candle range
- Maps 24h change to `sentiment` heuristic (±5% = extreme, ±2% = elevated)
- Returns deterministic `MarketState` for AgentGuard evaluation

### Step 2: Create Demo Example
- `examples/bitget-read-only-demo/index.ts`
- Runs 3 test symbols (BTCUSDT, ETHUSDT, SOLUSDT)
- Prints market state + AgentGuard decision for sample order
- Uses `BitgetMcpAdapter` in `dry_run` mode for execution simulation

### Step 3: Update Documentation
- Add `README.md` section: "Using Real Market Data with AgentGuard"
- Document env var setup for read-only mode
- Include troubleshooting for rate limits/timeouts

### Step 4: Verification
- TypeScript check passes
- Demo runs without credentials
- AgentGuard decisions match expected policy behavior
- No network errors in CI/CD environment

---

## Assumptions

1. `bgc` CLI can be installed globally or invoked via npx wrapper
2. Bitget public API endpoints are reachable from deployment environment
3. Rate limits (20 req/s) are sufficient for dashboard/data polling use cases
4. AgentGuard policy engine does not require sub-second market data freshness
5. Demo mode uses separate API credentials that do not affect live accounts

---

## Next Steps After Phase 5B

1. **Phase 5C**: Add authenticated read-only adapter for account/position queries
2. **Phase 5D**: Integrate paper-trading mode for end-to-end strategy testing
3. **Phase 5E**: Add safety-gated live execution with `AGENTGUARD_ALLOW_LIVE_TRADING` gate
4. **Phase 5F**: Dashboard integration showing real market data + AgentGuard decisions

---

## Safety Checklist for All Phases

- [ ] No API keys in source code or version control
- [ ] All write operations require explicit user confirmation
- [ ] `AGENTGUARD_ALLOW_LIVE_TRADING` gate defaults to `false`
- [ ] Paper/demo mode clearly labeled in UI/output
- [ ] Error messages never expose credentials or sensitive data
- [ ] Rate limiting implemented client-side as defense-in-depth
- [ ] All external calls wrapped in retry + timeout logic
