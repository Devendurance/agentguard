import { MarketState, OrderIntent } from "../types";
import { SkillHubMarketStateProvider } from "./market-state-provider";

/**
 * Options for configuring the Bitget public market data provider
 */
export interface BitgetPublicMarketProviderOptions {
  /**
   * Base URL for Bitget API
   * @default "https://api.bitget.com"
   */
  baseUrl?: string;
  /**
   * Product type for futures endpoints
   * @default "USDT-FUTURES"
   */
  productType?: string;
  /**
   * Candlestick granularity for volatility calculation
   * @default "1H"
   */
  candlesGranularity?: string;
  /**
   * Number of candles to fetch for volatility calculation
   * @default 24
   */
  candlesLimit?: number;
  /**
   * Whether to return fallback MarketState on fetch error
   * @default true
   */
  fallbackOnError?: boolean;
}

/**
 * Bitget public read-only market state provider
 * Fetches public market data and normalizes to AgentGuard MarketState
 * 
 * Safety: No credentials, no private endpoints, no order/account operations
 */
export class BitgetPublicMarketStateProvider implements SkillHubMarketStateProvider {
  private readonly baseUrl: string;
  private readonly productType: string;
  private readonly candlesGranularity: string;
  private readonly candlesLimit: number;
  private readonly fallbackOnError: boolean;

  constructor(options?: BitgetPublicMarketProviderOptions) {
    this.baseUrl = options?.baseUrl ?? "https://api.bitget.com";
    this.productType = options?.productType ?? "USDT-FUTURES";
    this.candlesGranularity = options?.candlesGranularity ?? "1H";
    this.candlesLimit = options?.candlesLimit ?? 24;
    this.fallbackOnError = options?.fallbackOnError ?? true;
  }

  /**
   * Fetch market state for an order from Bitget public APIs
   */
  async getMarketState(order: OrderIntent): Promise<MarketState> {
    try {
      // Fetch ticker data for current price and 24h change
      const tickerData = await this.fetchTicker(order.symbol);
      
      // Fetch funding rate for futures (if applicable)
      const fundingRate = await this.fetchFundingRate(order.symbol);
      
      // Fetch candles for volatility calculation
      const volatilityPct = await this.calculateVolatility(order.symbol);
      
      // Determine risk regime based on volatility and funding rate
      const riskRegime = this.determineRiskRegime(volatilityPct, fundingRate);
      
      return {
        symbol: order.symbol,
        fundingRate,
        volatilityPct,
        sentiment: "neutral", // TODO: integrate public sentiment source if available
        riskRegime,
        source: "bitget-public-api",
      };
    } catch (error) {
      if (this.fallbackOnError) {
        // Return safe fallback state on any fetch error
        return {
          symbol: order.symbol,
          fundingRate: undefined,
          volatilityPct: undefined,
          sentiment: "neutral",
          riskRegime: "normal",
          source: "fallback",
        };
      }
      // Re-throw if fallback is disabled
      throw error;
    }
  }

  /**
   * Fetch ticker data from Bitget public spot API
   * TODO: Confirm exact endpoint path from Bitget API docs
   * Expected pattern: /api/v2/spot/market/tickers?symbol={symbol}
   */
  private async fetchTicker(symbol: string): Promise<{ price: number; change24h: number } | null> {
    // TODO: Verify exact endpoint - using common Bitget public API pattern
    const url = `${this.baseUrl}/api/v2/spot/market/tickers?symbol=${encodeURIComponent(symbol)}`;
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data: any = await response.json();
      
      // Parse Bitget ticker response format
      // Expected: { code: "00000", data: [{ symbol, lastPr, chg24h, ... }] }
      if (data?.code === "00000" && Array.isArray(data.data) && data.data[0]) {
        const ticker = data.data[0];
        return {
          price: parseFloat(ticker.lastPr ?? ticker.close ?? 0),
          change24h: parseFloat(ticker.chg24h ?? ticker.change ?? 0),
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch funding rate from Bitget public futures API
   * TODO: Confirm exact endpoint path from Bitget API docs
   * Expected pattern: /api/v2/mix/market/funding-rate?symbol={symbol}&productType={productType}
   */
  private async fetchFundingRate(symbol: string): Promise<number | undefined> {
    // TODO: Verify exact endpoint - using common Bitget public API pattern
    const url = `${this.baseUrl}/api/v2/mix/market/funding-rate?symbol=${encodeURIComponent(symbol)}&productType=${encodeURIComponent(this.productType)}`;
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        return undefined;
      }
      
      const data: any = await response.json();
      
      // Parse Bitget funding rate response format
      // Expected: { code: "00000", data: { fundingRate, ... } }
      if (data?.code === "00000" && data.data?.fundingRate) {
        return parseFloat(data.data.fundingRate);
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Calculate volatility percentage from recent candle data
   * TODO: Confirm exact endpoint path from Bitget API docs
   * Expected pattern: /api/v2/spot/market/candles?symbol={symbol}&granularity={granularity}&limit={limit}
   */
  private async calculateVolatility(symbol: string): Promise<number | undefined> {
    // TODO: Verify exact endpoint - using common Bitget public API pattern
    const url = `${this.baseUrl}/api/v2/spot/market/candles?symbol=${encodeURIComponent(symbol)}&granularity=${encodeURIComponent(this.candlesGranularity)}&limit=${this.candlesLimit}`;
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        return undefined;
      }
      
      const data: any = await response.json();
      
      // Parse Bitget candles response format
      // Expected: { code: "00000", data: [[timestamp, open, high, low, close, ...], ...] }
      if (data?.code === "00000" && Array.isArray(data.data) && data.data.length >= 2) {
        const candles = data.data;
        const closes = candles.map((c: any) => parseFloat(c[4] ?? c[3] ?? 0)).filter((v: number) => !isNaN(v));
        
        if (closes.length < 2) return undefined;
        
        // Calculate simple volatility as % range from min to max close
        const min = Math.min(...closes);
        const max = Math.max(...closes);
        const avg = closes.reduce((a: number, b: number) => a + b, 0) / closes.length;
        
        if (avg === 0) return undefined;
        
        // Volatility as percentage of average price
        return ((max - min) / avg) * 100;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Determine risk regime based on volatility and funding rate thresholds
   */
  private determineRiskRegime(volatilityPct?: number, fundingRate?: number): "normal" | "elevated" | "extreme" {
    const vol = volatilityPct ?? 0;
    const fund = Math.abs(fundingRate ?? 0);
    
    // Extreme: very high volatility or funding stress
    if (vol >= 12 || fund >= 0.08) {
      return "extreme";
    }
    // Elevated: moderate volatility or funding pressure
    if (vol >= 8 || fund >= 0.05) {
      return "elevated";
    }
    // Normal: within acceptable ranges
    return "normal";
  }
}
