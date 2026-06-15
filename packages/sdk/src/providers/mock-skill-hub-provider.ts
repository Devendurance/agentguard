import { MarketState, OrderIntent } from "../types";
import { SkillHubMarketStateProvider, SkillHubSource } from "./market-state-provider";

/**
 * Scenario options for mock market state provider
 * Each scenario returns a deterministic MarketState for testing
 */
export interface MockSkillHubProviderOptions {
  scenario?: "normal" | "extreme_regime" | "extreme_sentiment" | "high_volatility" | "funding_stress";
}

/**
 * Mock Skill Hub Market State Provider
 * 
 * Returns deterministic MarketState objects based on selected scenario.
 * Useful for testing AgentGuard market-risk rules without calling real Skill Hub tools.
 * 
 * In production, replace with a real provider that calls:
 * - sentiment-analyst for sentiment/funding data
 * - technical-analysis for volatility/indicator data
 * - market-intel for on-chain/institutional flow data
 */
export class MockSkillHubMarketStateProvider implements SkillHubMarketStateProvider {
  private scenario: NonNullable<MockSkillHubProviderOptions["scenario"]>;

  constructor(options?: MockSkillHubProviderOptions) {
    this.scenario = options?.scenario ?? "normal";
  }

  /**
   * Return deterministic MarketState based on configured scenario
   */
  async getMarketState(order: OrderIntent): Promise<MarketState> {
    switch (this.scenario) {
      case "normal":
        return this.normalMarket(order);
      case "extreme_regime":
        return this.extremeRegimeMarket(order);
      case "extreme_sentiment":
        return this.extremeSentimentMarket(order);
      case "high_volatility":
        return this.highVolatilityMarket(order);
      case "funding_stress":
        return this.fundingStressMarket(order);
      default:
        return this.normalMarket(order);
    }
  }

  /**
   * Normal market conditions - all values within safe ranges
   */
  private normalMarket(order: OrderIntent): MarketState {
    return {
      symbol: order.symbol,
      fundingRate: 0.01,
      volatilityPct: 2.5,
      sentiment: "neutral",
      riskRegime: "normal",
      source: "mock",
    };
  }

  /**
   * Extreme risk regime - should trigger blockOnExtremeRegime rule
   */
  private extremeRegimeMarket(order: OrderIntent): MarketState {
    return {
      symbol: order.symbol,
      fundingRate: 0.01,
      volatilityPct: 2.5,
      sentiment: "neutral",
      riskRegime: "extreme",
      source: "bitget-skill-hub",
    };
  }

  /**
   * Extreme sentiment (fear) - should trigger blockOnExtremeSentiment rule
   */
  private extremeSentimentMarket(order: OrderIntent): MarketState {
    return {
      symbol: order.symbol,
      fundingRate: 0.01,
      volatilityPct: 2.5,
      sentiment: "extreme_fear",
      riskRegime: "elevated",
      source: "sentiment-analyst",
    };
  }

  /**
   * High volatility - should trigger volatility_stress rule when > maxVolatilityPct
   */
  private highVolatilityMarket(order: OrderIntent): MarketState {
    return {
      symbol: order.symbol,
      fundingRate: 0.01,
      volatilityPct: 12,
      sentiment: "neutral",
      riskRegime: "elevated",
      source: "technical-analysis",
    };
  }

  /**
   * Funding stress - should trigger funding_stress rule when |fundingRate| > maxFundingRateAbs
   */
  private fundingStressMarket(order: OrderIntent): MarketState {
    return {
      symbol: order.symbol,
      fundingRate: 0.08,
      volatilityPct: 3,
      sentiment: "neutral",
      riskRegime: "elevated",
      source: "sentiment-analyst",
    };
  }
}
