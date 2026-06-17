import { GuardAction, RiskEvent, RiskPolicy } from "../types";

/**
 * Severity level for dashboard event rows
 * Used for visual styling and filtering in the dashboard UI
 */
export type DashboardSeverity = "safe" | "warning" | "danger" | "neutral";

/**
 * Dashboard-friendly representation of a RiskEvent
 * Flattened and enriched for table display and filtering
 */
export interface DashboardEventRow {
  id: string;
  timestamp: string;
  symbol: string;
  action: string;
  reason: string;
  severity: DashboardSeverity;
  notionalUsd: number;
  leverage: number;
  forwarded?: boolean;
  source?: string;
}

/**
 * Aggregated metrics for dashboard summary cards
 */
export interface DashboardMetrics {
  ordersEvaluated: number;
  approved: number;
  resized: number;
  blocked: number;
  flattened: number;
  paused: number;
  marketRiskBlocks: number;
  forwardedToExecution: number;
  blockedBeforeExecution: number;
  approvalRatePct: number;
  currentRiskMode: "active" | "flat" | "paused" | "monitor";
  policyHealth: "healthy" | "warning" | "critical";
}

/**
 * Complete dataset for dashboard consumption
 * Includes metrics, event rows, and optional policy snapshot
 */
export interface DashboardDataset {
  generatedAt: string;
  metrics: DashboardMetrics;
  events: DashboardEventRow[];
  policy?: RiskPolicy;
}
