# Bitget MCP / Agent Hub Adapter Plan

## Overview

This document outlines the integration plan for connecting AgentGuard SDK to Bitget MCP / Agent Hub execution infrastructure. AgentGuard currently uses a mock Bitget-shaped `ExecutionClient`. This plan describes how to build a real adapter without breaking the working SDK.

---

## What Was Found Locally

### Project Dependencies
- `@bitget-ai/getagent-skill@^0.2.1` installed in root `package.json`
- No explicit MCP configuration files found
- No `.mcp.json` or `mcp-config.json` present

### Available Bitget Skills (System Skills Directory)
Located in `C:\Users\USER\.codex\skills/`:

| Skill | Purpose | Relevance to AgentGuard |
|-------|---------|------------------------|
| `bitget-skill` | Full Bitget exchange CLI via `bgc` tool | Primary execution adapter source |
| `getagent` | GetAgent Playbook authoring/validation | Strategy orchestration layer |
| `sentiment-analyst` | Market sentiment, L/S ratios, funding, OI | MarketState provider for risk evaluation |
| `technical-analysis` | Technical indicators, volatility, price levels | MarketState provider for volatility/risk regime |
| `market-intel` | On-chain/institutional flows | Optional MarketState enrichment |

### Bitget Skill Capabilities (from `bitget-skill/commands.md`)
- **Spot trading**: `spot_place_order`, `spot_cancel_orders`, `spot_modify_order`
- **Futures trading**: `futures_place_order`, `futures_cancel_orders`, `futures_positions`
- **Account management**: `account_get_balances`, `account_get_positions`, `account_transfer`
- **Leverage config**: `futures_leverage_config`
- **Demo/paper trading**: Supported via `bgc` CLI flags

### Integration Surface Assessment
- ? Bitget execution reachable via `bgc` CLI tool (bitget-skill)
- ? Market/account state reachable via sentiment-analyst, technical-analysis, bitget-skill
- ?? No direct MCP server configuration found locally (may require setup)
- ?? getagent Playbook execution is sandbox/cloud-based, not local SDK

---

## Recommended Adapter Architecture

### File Path
```
packages/sdk/src/adapters/bitget-mcp-adapter.ts
```

### Adapter Interface Implementation
The adapter implements the existing `ExecutionClient` interface:

```typescript
export interface ExecutionClient {
  placeOrder(order: OrderIntent): Promise<unknown>;
  setLeverage?(symbol: string, leverage: number): Promise<unknown>;
  closePosition?(symbol: string): Promise<unknown>;
  cancelOrder?(orderId: string): Promise<unknown>;
}
```

### Method Mapping Table

| ExecutionClient Method | Bitget Tool/Function | Risk Level | Should AgentGuard Guard? | Implement Now? |
|------------------------|---------------------|------------|-------------------------|----------------|
| `placeOrder(order)` | `bgc spot/futures_place_order` | ?? High | ? Yes | ? Yes (dry-run first) |
| `setLeverage(symbol, leverage)` | `bgc futures_leverage_config` | ?? High | ? Yes | ?? Later (Phase 3) |
| `closePosition(symbol)` | `bgc futures_close_position` + position check | ?? High | ? Yes | ?? Later (Phase 3) |
| `cancelOrder(orderId)` | `bgc spot/futures_cancel_orders` | ?? Medium | ?? Optional | ?? Later (Phase 3) |

**Notes:**
- `placeOrder` is the primary integration point; all other methods can be added incrementally
- Leverage/position changes are high-risk and should have stricter policy rules
- Cancel operations are lower-risk but still require audit logging

---

## Safety Modes Design

The adapter should support three operational modes, controlled by environment variable:

### 1. `dry_run` (Default)
```env
AGENTGUARD_ADAPTER_MODE=dry_run
```
- Does NOT call Bitget APIs or `bgc` CLI
- Logs the exact payload that would be sent
- Returns mock success response for testing
- Use for: development, policy testing, demo validation

### 2. `paper` (Sandbox)
```env
AGENTGUARD_ADAPTER_MODE=paper
```
- Calls Bitget demo/paper trading endpoints if available
- Uses `bgc --demo` or testnet flags
- Real API structure, no real funds at risk
- Use for: integration testing, policy validation with real responses

### 3. `live` (Production)
```env
AGENTGUARD_ADAPTER_MODE=live
AGENTGUARD_ALLOW_LIVE_TRADING=true  # Required explicit opt-in
```
- Calls real Bitget execution APIs
- Requires valid API credentials in environment
- Disabled by default; requires explicit environment variable
- Use for: production deployment after audit

**Implementation Note:** The adapter constructor should read `process.env.AGENTGUARD_ADAPTER_MODE` and throw if `live` mode is requested without `AGENTGUARD_ALLOW_LIVE_TRADING=true`.

---

## Market/Account State Provider Plan

AgentGuard requires `AccountState` and `MarketState` for risk evaluation. These can be sourced from Bitget Skill Hub tools.

### AccountState Provider
```typescript
interface AccountState {
  equityUsd: number;
  dailyPnlUsd: number;
  dailyDrawdownPct: number;
  totalDrawdownPct?: number;
  openExposureUsd?: number;
  symbolExposureUsd?: Record<string, number>;
}
```

**Data Sources:**
| Field | Source Skill/Tool | Notes |
|-------|------------------|-------|
| `equityUsd` | `bitget-skill: account_get_balances` | Sum of available + position value |
| `dailyPnlUsd` | `bitget-skill: account_get_positions` | Calculate from position PnL |
| `dailyDrawdownPct` | Computed from equity history | May require caching previous equity |
| `openExposureUsd` | `bitget-skill: account_get_positions` | Sum of position notional values |
| `symbolExposureUsd` | `bitget-skill: account_get_positions` | Map symbol ? exposure |

### MarketState Provider
```typescript
interface MarketState {
  symbol: string;
  fundingRate?: number;
  volatilityPct?: number;
  sentiment?: "positive" | "neutral" | "negative" | "extreme_fear" | "extreme_greed";
  riskRegime?: "normal" | "elevated" | "extreme";
  source?: "mock" | "bitget-skill-hub" | "manual";
}
```

**Data Sources:**
| Field | Source Skill/Tool | Notes |
|-------|------------------|-------|
| `fundingRate` | `bitget-skill: futures_get_funding_rate` | Per-symbol funding rate |
| `volatilityPct` | `technical-analysis: get_atr` or Bollinger width | ATR-based or price range |
| `sentiment` | `sentiment-analyst: sentiment_index` | Map to enum values |
| `riskRegime` | Computed from volatility + sentiment | Heuristic: high vol + extreme sentiment = "extreme" |
| `source` | Hardcoded as `"bitget-skill-hub"` | For audit trail |

**Provider Implementation Strategy:**
- Create `AccountStateProvider` and `MarketStateProvider` functions that wrap skill calls
- Cache results for short TTL (e.g., 30s) to avoid rate limits
- Fall back to `undefined` if skill call fails (AgentGuard's `failClosed` policy handles this)

---

## Recommended Next Implementation Step

### Build a Dry-Run Bitget MCP Adapter First

**Goal:** Prove the integration flow without calling live Bitget APIs.

**Scope:**
1. Create `packages/sdk/src/adapters/bitget-mcp-adapter.ts`
2. Implement only `placeOrder(order: OrderIntent): Promise<unknown>`
3. Default to `dry_run` mode
4. Log the order payload that would be sent to Bitget
5. Return a mock response matching Bitget API shape

**Expected Flow:**
```
AI Agent Order Intent
  ? AgentGuard.evaluateOrder()
  ? Policy evaluation (approve/resize/block)
  ? If approved: adapter.placeOrder()
  ? Dry-run: log payload, return mock response
  ? Event log records decision + mock execution result
```

**Success Criteria:**
- Demo shows real policy decisions (approve/resize/block)
- Dry-run logs show Bitget-shaped payloads
- No real API calls made
- Adapter can later be switched to `paper` or `live` mode with config change

---

## Risks / Unknowns

| Risk | Mitigation |
|------|-----------|
| `bgc` CLI not installed in user environment | Adapter should check `bgc --version` and provide install instructions |
| Bitget API credentials required for non-dry modes | Document credential setup; never prompt for credentials in code |
| Rate limits on Bitget API calls | Implement request queuing/backoff in adapter; cache state provider results |
| Skill Hub API changes | Pin skill versions; use adapter abstraction to isolate API changes |
| MCP server configuration complexity | Start with CLI-based adapter; add MCP protocol support in Phase 3 |
| State provider latency affecting order evaluation | Use async state fetching with timeouts; failClosed policy handles missing state |

---

## Next Implementation Prompt

When ready to implement, use this prompt:

```
Create packages/sdk/src/adapters/bitget-mcp-adapter.ts

Requirements:
1. Import ExecutionClient, OrderIntent from "../types"
2. Export function: createBitgetMcpAdapter(options: { mode?: "dry_run" | "paper" | "live" }): ExecutionClient
3. Implement placeOrder(order: OrderIntent): Promise<unknown>
4. In dry_run mode: log order to console, return mock Bitget-shaped response
5. In paper/live modes: throw Error("Not implemented yet - use dry_run for MVP")
6. Read mode from process.env.AGENTGUARD_ADAPTER_MODE, default to "dry_run"
7. Require AGENTGUARD_ALLOW_LIVE_TRADING=true for live mode
8. Add JSDoc comments explaining each method

Do not call real Bitget APIs. Do not use API keys. Keep implementation minimal.
```

---

## Appendix: File Structure After Implementation

```
packages/
  sdk/
    src/
      adapters/
        bitget-mcp-adapter.ts    # NEW: Bitget execution adapter
      types.ts                   # Existing: includes ExecutionClient interface
      ...                        # Other SDK files unchanged
examples/
  basic-wrapper/
    index.ts                     # Can swap mock client for bitget-mcp-adapter
agentguard.policy.example.json   # Existing policy config
docs/
  bitget-adapter-plan.md         # THIS FILE
```

---

*Document created: 2026-06-12*
*Status: Planning phase - no code implemented yet*
