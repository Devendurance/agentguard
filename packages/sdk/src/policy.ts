import { RiskPolicy, MarketRiskPolicy } from "./types";
import { readFile } from "fs/promises";

/**
 * Load and validate a risk policy from a JSON file path
 */
export async function loadPolicy(path: string): Promise<RiskPolicy> {
  const content = await readFile(path, "utf-8");
  const policy = JSON.parse(content) as RiskPolicy;
  validatePolicy(policy);
  return policy;
}

/**
 * Validate a RiskPolicy object against required constraints
 * Throws Error with human-readable message if validation fails
 */
export function validatePolicy(policy: RiskPolicy): void {
  if (!policy) {
    throw new Error("RiskPolicy is required");
  }

  // Validate mode
  const validModes = ["active", "monitor", "paused"] as const;
  if (!validModes.includes(policy.mode)) {
    throw new Error(
      `Invalid policy.mode: "${policy.mode}". Must be one of: ${validModes.join(", ")}`
    );
  }

  // Validate numeric constraints
  if (typeof policy.maxLeverage !== "number" || policy.maxLeverage <= 0) {
    throw new Error("policy.maxLeverage must be a positive number");
  }
  if (typeof policy.maxOrderUsd !== "number" || policy.maxOrderUsd <= 0) {
    throw new Error("policy.maxOrderUsd must be a positive number");
  }
  if (
    typeof policy.maxDailyDrawdownPct !== "number" ||
    policy.maxDailyDrawdownPct <= 0
  ) {
    throw new Error("policy.maxDailyDrawdownPct must be a positive number");
  }

  // Validate allowedSymbols
  if (!Array.isArray(policy.allowedSymbols)) {
    throw new Error("policy.allowedSymbols must be an array");
  }

  // Validate failClosed
  if (typeof policy.failClosed !== "boolean") {
    throw new Error("policy.failClosed must be a boolean");
  }

  // Validate actions object
  if (!policy.actions) {
    throw new Error("policy.actions is required");
  }

  const validOversizedActions = ["resize", "block"] as const;
  if (!validOversizedActions.includes(policy.actions.onOversizedOrder)) {
    throw new Error(
      `Invalid actions.onOversizedOrder: "${policy.actions.onOversizedOrder}". Must be one of: ${validOversizedActions.join(", ")}`
    );
  }

  const validDrawdownActions = ["flatten", "block"] as const;
  if (!validDrawdownActions.includes(policy.actions.onDrawdownBreach)) {
    throw new Error(
      `Invalid actions.onDrawdownBreach: "${policy.actions.onDrawdownBreach}". Must be one of: ${validDrawdownActions.join(", ")}`
    );
  }

  if (policy.actions.onUnknownRiskState !== "block") {
    throw new Error(
      `Invalid actions.onUnknownRiskState: "${policy.actions.onUnknownRiskState}". Must be "block"`
    );
  }

  // Validate optional marketRisk configuration
  if (policy.marketRisk !== undefined) {
    validateMarketRisk(policy.marketRisk);
  }
}

/**
 * Validate optional MarketRiskPolicy configuration
 */
function validateMarketRisk(marketRisk: MarketRiskPolicy): void {
  if (typeof marketRisk.enabled !== "boolean") {
    throw new Error("marketRisk.enabled must be a boolean");
  }

  if (
    marketRisk.blockOnExtremeRegime !== undefined &&
    typeof marketRisk.blockOnExtremeRegime !== "boolean"
  ) {
    throw new Error("marketRisk.blockOnExtremeRegime must be a boolean if provided");
  }

  if (
    marketRisk.blockOnExtremeSentiment !== undefined &&
    typeof marketRisk.blockOnExtremeSentiment !== "boolean"
  ) {
    throw new Error("marketRisk.blockOnExtremeSentiment must be a boolean if provided");
  }

  if (
    marketRisk.maxFundingRateAbs !== undefined &&
    (typeof marketRisk.maxFundingRateAbs !== "number" || marketRisk.maxFundingRateAbs <= 0)
  ) {
    throw new Error("marketRisk.maxFundingRateAbs must be a positive number if provided");
  }

  if (
    marketRisk.maxVolatilityPct !== undefined &&
    (typeof marketRisk.maxVolatilityPct !== "number" || marketRisk.maxVolatilityPct <= 0)
  ) {
    throw new Error("marketRisk.maxVolatilityPct must be a positive number if provided");
  }

  if (marketRisk.actionOnMarketRisk !== undefined) {
    const validActions = ["block", "resize"] as const;
    if (!validActions.includes(marketRisk.actionOnMarketRisk)) {
      throw new Error(
        `Invalid marketRisk.actionOnMarketRisk: "${marketRisk.actionOnMarketRisk}". Must be one of: ${validActions.join(", ")}`
      );
    }
  }
}
