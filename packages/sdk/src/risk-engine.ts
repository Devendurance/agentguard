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

  // Rule 6: oversized order
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

  // Rule 7: approve - all checks passed
  return {
    action: "approve",
    approved: true,
    reason: "within_policy",
    originalOrder: order,
    policySnapshot: policy,
  };
}
