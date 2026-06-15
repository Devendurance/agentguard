import { MarketState, OrderIntent } from "../types";

/**
 * Source identifiers for market state data
 * Matches Bitget Skill Hub skill names for traceability
 */
export type SkillHubSource =
  | "mock"
  | "bitget-skill-hub"
  | "sentiment-analyst"
  | "technical-analysis"
  | "market-intel";

/**
 * Provider interface for fetching market state
 * 
 * Implementations can wrap:
 * - Mock local data (for testing)
 * - Bitget Skill Hub tools (sentiment-analyst, technical-analysis, market-intel)
 * - MCP server calls
 * - Direct Bitget API queries
 * 
 * The provider normalizes external data into AgentGuard's MarketState shape.
 */
export interface SkillHubMarketStateProvider {
  /**
   * Fetch market state for a given order intent
   * @param order - The order being evaluated
   * @returns Promise resolving to MarketState for risk evaluation
   */
  getMarketState(order: OrderIntent): Promise<MarketState>;
}
