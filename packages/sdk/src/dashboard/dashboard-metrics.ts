import { RiskEvent, RiskPolicy } from "../types";
import {
  DashboardEventRow,
  DashboardMetrics,
  DashboardDataset,
  DashboardSeverity,
} from "./dashboard-types";

/**
 * Convert a RiskEvent to a dashboard-friendly event row
 * @param event - The risk event from AgentGuard
 * @param forwarded - Whether the order was forwarded to execution (optional)
 * @returns DashboardEventRow for table display
 */
export function eventToDashboardRow(
  event: RiskEvent,
  forwarded?: boolean
): DashboardEventRow {
  const { action, reason } = event.decision;
  const { symbol, notionalUsd, leverage } = event.order;

  // Determine severity based on action and reason
  const severity = determineSeverity(action, reason);

  return {
    id: event.id,
    timestamp: event.timestamp,
    symbol,
    action,
    reason: reason ?? "",
    severity,
    notionalUsd,
    leverage,
    forwarded,
    source: event.marketState?.source,
  };
}

/**
 * Determine dashboard severity from action and reason
 */
function determineSeverity(
  action: string,
  reason?: string
): DashboardSeverity {
  // Safe: approved orders
  if (action === "approve" || reason === "within_policy") {
    return "safe";
  }

  // Warning: resized orders
  if (action === "resize") {
    return "warning";
  }

  // Danger: blocked/flattened/paused/reduce_only orders
  if (
    action === "block" ||
    action === "flatten" ||
    action === "pause" ||
    action === "reduce_only"
  ) {
    return "danger";
  }

  // Default: neutral
  return "neutral";
}

/**
 * Check if a reason is related to market-risk rules
 */
export function isMarketRiskReason(reason?: string): boolean {
  if (!reason) return false;

  const marketRiskReasons = [
    "extreme_market_regime",
    "extreme_market_regime_resized",
    "extreme_sentiment",
    "extreme_sentiment_resized",
    "funding_stress",
    "funding_stress_resized",
    "volatility_stress",
    "volatility_stress_resized",
  ];

  return marketRiskReasons.includes(reason);
}

/**
 * Build aggregated dashboard metrics from risk events
 */
export function buildDashboardMetrics(
  events: RiskEvent[],
  policy?: RiskPolicy
): DashboardMetrics {
  const approved = events.filter((e) => e.decision.action === "approve").length;
  const resized = events.filter((e) => e.decision.action === "resize").length;
  const blocked = events.filter((e) => e.decision.action === "block").length;
  const flattened = events.filter((e) => e.decision.action === "flatten").length;
  const paused = events.filter((e) => e.decision.action === "pause").length;

  // Count market-risk related blocks/resizes
  const marketRiskBlocks = events.filter(
    (e) =>
      isMarketRiskReason(e.decision.reason) &&
      (e.decision.action === "block" || e.decision.action === "resize")
  ).length;

  // Calculate forwarding metrics
  const forwardedToExecution = approved + resized;
  const blockedBeforeExecution = blocked + flattened + paused;

  // Calculate approval rate percentage
  const approvalRatePct =
    events.length > 0
      ? Math.round((forwardedToExecution / events.length) * 1000) / 10
      : 0;

  // Determine current risk mode
  let currentRiskMode: DashboardMetrics["currentRiskMode"] = "active";
  if (paused > 0 || policy?.mode === "paused") {
    currentRiskMode = "paused";
  } else if (flattened > 0) {
    currentRiskMode = "flat";
  } else if (policy?.mode === "monitor") {
    currentRiskMode = "monitor";
  }

  // Determine policy health
  let policyHealth: DashboardMetrics["policyHealth"] = "healthy";
  if (paused > 0 || flattened > 0) {
    policyHealth = "critical";
  } else if (blocked > 0 || marketRiskBlocks > 0) {
    policyHealth = "warning";
  }

  return {
    ordersEvaluated: events.length,
    approved,
    resized,
    blocked,
    flattened,
    paused,
    marketRiskBlocks,
    forwardedToExecution,
    blockedBeforeExecution,
    approvalRatePct,
    currentRiskMode,
    policyHealth,
  };
}

/**
 * Build complete dashboard dataset from events and policy
 */
export function buildDashboardDataset(
  events: RiskEvent[],
  policy?: RiskPolicy
): DashboardDataset {
  return {
    generatedAt: new Date().toISOString(),
    metrics: buildDashboardMetrics(events, policy),
    events: events.map((event) => eventToDashboardRow(event)),
    policy,
  };
}
