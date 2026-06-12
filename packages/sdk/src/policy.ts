import { RiskPolicy } from "./types";
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
}
