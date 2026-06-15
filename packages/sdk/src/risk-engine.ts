import {
  OrderIntent,
  AccountState,
  MarketState,
  RiskPolicy,
  GuardDecision,
} from "./types";

/**
 * Evaluate an order against risk policy using deterministic rules
 * Rules are checked in order; first match returns immediately
 */
export function evaluateRisk(
  order: OrderIntent,
  accountState: AccountState | undefined,
  marketState: MarketState | undefined,
  policy: RiskPolicy
): GuardDecision {
  // Rule 1: paused mode
  if (policy.mode === "paused") {
    return {
      action: "pause",
      approved: false,
      reason: "policy_paused",
      originalOrder: order,
      policySnapshot: policy,
    };
  }

  // Rule 2: fail closed on missing state
  if (policy.failClosed && (!accountState || !marketState)) {
    return {
      action: "block",
      approved: false,
      reason: "unknown_risk_state",
      originalOrder: order,
      policySnapshot: policy,
    };
  }

  // Rule 3: symbol allowlist
  if (!policy.allowedSymbols.includes(order.symbol)) {
    return {
      action: "block",
      approved: false,
      reason: "symbol_not_allowed",
      originalOrder: order,
      policySnapshot: policy,
    };
  }

  // Rule 4: leverage limit
  if (order.leverage > policy.maxLeverage) {
    return {
      action: "block",
      approved: false,
      reason: "max_leverage_exceeded",
      originalOrder: order,
      policySnapshot: policy,
    };
  }

  // Rule 5: daily drawdown breach
  if (accountState && accountState.dailyDrawdownPct >= policy.maxDailyDrawdownPct) {
    const action =
      policy.actions.onDrawdownBreach === "flatten" ? "flatten" : "block";
    return {
      action,
      approved: false,
      reason: "daily_drawdown_breach",
      originalOrder: order,
      policySnapshot: policy,
    };
  }

  // Rule 6: market-risk checks (only if enabled)
  if (policy.marketRisk?.enabled) {
    const marketRiskResult = evaluateMarketRisk(order, marketState, policy.marketRisk);
    if (marketRiskResult) {
      return {
        ...marketRiskResult,
        originalOrder: order,
        policySnapshot: policy,
      };
    }
  }

  // Rule 7: oversized order
  if (order.notionalUsd > policy.maxOrderUsd) {
    if (policy.actions.onOversizedOrder === "resize") {
      const modifiedOrder: OrderIntent = {
        ...order,
        notionalUsd: policy.maxOrderUsd,
      };
      return {
        action: "resize",
        approved: true,
        reason: "max_order_size_exceeded_resized",
        originalOrder: order,
        modifiedOrder,
        policySnapshot: policy,
      };
    } else {
      return {
        action: "block",
        approved: false,
        reason: "max_order_size_exceeded",
        originalOrder: order,
        policySnapshot: policy,
      };
    }
  }

  // Rule 8: approve - all checks passed
  return {
    action: "approve",
    approved: true,
    reason: "within_policy",
    originalOrder: order,
    policySnapshot: policy,
  };
}

/**
 * Evaluate market-risk rules when policy.marketRisk.enabled is true
 * Returns a partial GuardDecision if a market-risk rule is violated, or null if all pass
 */
function evaluateMarketRisk(
  order: OrderIntent,
  marketState: MarketState | undefined,
  marketRisk: NonNullable<RiskPolicy["marketRisk"]>
): Omit<GuardDecision, "originalOrder" | "policySnapshot"> | null {
  const action = marketRisk.actionOnMarketRisk ?? "block";
  const approved = action === "resize";

  // Check 1: Extreme risk regime
  if (
    marketRisk.blockOnExtremeRegime &&
    marketState?.riskRegime === "extreme"
  ) {
    return createMarketRiskDecision(action, approved, "extreme_market_regime", order);
  }

  // Check 2: Extreme sentiment
  if (
    marketRisk.blockOnExtremeSentiment &&
    (marketState?.sentiment === "extreme_fear" ||
      marketState?.sentiment === "extreme_greed")
  ) {
    return createMarketRiskDecision(action, approved, "extreme_sentiment", order);
  }

  // Check 3: Funding stress
  if (
    marketRisk.maxFundingRateAbs !== undefined &&
    marketState?.fundingRate !== undefined &&
    Math.abs(marketState.fundingRate) > marketRisk.maxFundingRateAbs
  ) {
    return createMarketRiskDecision(action, approved, "funding_stress", order);
  }

  // Check 4: Volatility stress
  if (
    marketRisk.maxVolatilityPct !== undefined &&
    marketState?.volatilityPct !== undefined &&
    marketState.volatilityPct > marketRisk.maxVolatilityPct
  ) {
    return createMarketRiskDecision(action, approved, "volatility_stress", order);
  }

  // All market-risk checks passed
  return null;
}

/**
 * Helper to create a market-risk decision with optional resize logic
 */
function createMarketRiskDecision(
  action: "block" | "resize",
  approved: boolean,
  baseReason: string,
  order: OrderIntent
): Omit<GuardDecision, "originalOrder" | "policySnapshot"> {
  if (action === "resize") {
    // For resize: cap order size to policy max (simplified market-risk resize)
    const modifiedOrder: OrderIntent = {
      ...order,
      notionalUsd: Math.min(order.notionalUsd, 250), // Use a conservative cap
    };
    return {
      action: "resize",
      approved: true,
      reason: `${baseReason}_resized`,
      modifiedOrder,
    };
  }
  return {
    action: "block",
    approved: false,
    reason: baseReason,
  };
}
