// AgentGuard SDK - Core Type Definitions
// Bitget-shaped mock client compatible interfaces

/**
 * Guard decision actions returned by the risk engine
 */
export type GuardAction =
  | "approve"
  | "block"
  | "resize"
  | "reduce_only"
  | "flatten"
  | "pause";

/**
 * Order side: buy or sell
 */
export type OrderSide = "buy" | "sell";

/**
 * Order type: market or limit
 */
export type OrderType = "market" | "limit";

/**
 * Order intent submitted by an AI trading agent
 */
export interface OrderIntent {
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  notionalUsd: number;
  leverage: number;
  reduceOnly?: boolean;
  price?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Current account state for risk evaluation
 */
export interface AccountState {
  equityUsd: number;
  dailyPnlUsd: number;
  dailyDrawdownPct: number;
  totalDrawdownPct?: number;
  openExposureUsd?: number;
  symbolExposureUsd?: Record<string, number>;
}

/**
 * Current market state for risk evaluation
 */
export interface MarketState {
  symbol: string;
  fundingRate?: number;
  volatilityPct?: number;
  sentiment?: "positive" | "neutral" | "negative" | "extreme_fear" | "extreme_greed";
  riskRegime?: "normal" | "elevated" | "extreme";
  source?: "mock" | "bitget-skill-hub" | "manual" | "technical-analysis" | "sentiment-analyst";
}

/**
 * Optional market-risk policy configuration
 * When enabled, AgentGuard evaluates market conditions before approving orders
 */
export interface MarketRiskPolicy {
  enabled: boolean;
  blockOnExtremeRegime?: boolean;
  blockOnExtremeSentiment?: boolean;
  maxFundingRateAbs?: number;
  maxVolatilityPct?: number;
  actionOnMarketRisk?: "block" | "resize";
}

/**
 * Risk policy configuration loaded from JSON
 */
export interface RiskPolicy {
  mode: "active" | "monitor" | "paused";
  maxLeverage: number;
  maxOrderUsd: number;
  maxDailyDrawdownPct: number;
  allowedSymbols: string[];
  failClosed: boolean;
  actions: {
    onOversizedOrder: "resize" | "block";
    onDrawdownBreach: "flatten" | "block";
    onUnknownRiskState: "block";
  };
  marketRisk?: MarketRiskPolicy;
}

/**
 * Decision returned by the guard after evaluation
 */
export interface GuardDecision {
  action: GuardAction;
  approved: boolean;
  reason?: string;
  originalOrder: OrderIntent;
  modifiedOrder?: OrderIntent;
  policySnapshot?: RiskPolicy;
}

/**
 * Risk event logged for audit and debugging
 */
export interface RiskEvent {
  id: string;
  timestamp: string;
  order: OrderIntent;
  decision: GuardDecision;
  accountState?: AccountState;
  marketState?: MarketState;
}

/**
 * Generic execution client interface - Bitget-shaped
 * Can be implemented by:
 * - Mock local client (for testing)
 * - Real Bitget API client
 * - Bitget MCP adapter
 * - Agent Hub tool caller
 */
export interface ExecutionClient {
  placeOrder(order: OrderIntent): Promise<unknown>;
  setLeverage?(symbol: string, leverage: number): Promise<unknown>;
  closePosition?(symbol: string): Promise<unknown>;
  cancelOrder?(orderId: string): Promise<unknown>;
}
