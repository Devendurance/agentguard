import { ExecutionClient, OrderIntent } from "../types";

/**
 * Operational mode for the Bitget MCP adapter
 */
export type BitgetAdapterMode = "dry_run" | "paper" | "live";

/**
 * Configuration options for BitgetMcpAdapter
 */
export interface BitgetMcpAdapterOptions {
  mode?: BitgetAdapterMode;
  allowLiveTrading?: boolean;
}

/**
 * Result returned by dry-run operations
 * Contains the payload that would be sent to Bitget, without actually sending it
 */
export interface BitgetDryRunResult {
  mode: BitgetAdapterMode;
  status: "dry_run_not_sent";
  operation: "placeOrder" | "setLeverage" | "closePosition" | "cancelOrder";
  payload: unknown;
  timestamp: string;
  note: string;
}

/**
 * Bitget MCP Adapter - implements ExecutionClient interface
 * 
 * In dry_run mode (default): logs payloads without calling Bitget APIs
 * In paper mode: would call Bitget demo/testnet endpoints (not implemented yet)
 * In live mode: would call real Bitget APIs (requires explicit opt-in)
 * 
 * SAFETY: Live mode requires BOTH:
 * - options.allowLiveTrading === true
 * - process.env.AGENTGUARD_ALLOW_LIVE_TRADING === "true"
 */
export class BitgetMcpAdapter implements ExecutionClient {
  private mode: BitgetAdapterMode;
  private allowLiveTrading: boolean;

  constructor(options?: BitgetMcpAdapterOptions) {
    this.mode = options?.mode ?? "dry_run";
    this.allowLiveTrading = options?.allowLiveTrading ?? false;

    // Safety check: live mode requires explicit opt-in via code AND env var
    if (this.mode === "live") {
      const envAllowsLive = process.env.AGENTGUARD_ALLOW_LIVE_TRADING === "true";
      if (!this.allowLiveTrading || !envAllowsLive) {
        throw new Error(
          "Live trading is disabled. Set allowLiveTrading=true and AGENTGUARD_ALLOW_LIVE_TRADING=true to enable."
        );
      }
    }

    // Paper/live modes not implemented yet in this phase
    if (this.mode !== "dry_run") {
      throw new Error(
        `Mode "${this.mode}" is not implemented yet. Use dry_run.`
      );
    }
  }

  /**
   * Place an order in dry-run mode
   * Does NOT call Bitget APIs - returns a BitgetDryRunResult with the payload
   */
  async placeOrder(order: OrderIntent): Promise<BitgetDryRunResult> {
    const payload = this.toBitgetOrderPayload(order);
    return this.createDryRunResult("placeOrder", payload);
  }

  /**
   * Set leverage in dry-run mode
   * Does NOT call Bitget APIs - returns a BitgetDryRunResult with the payload
   */
  async setLeverage(
    symbol: string,
    leverage: number
  ): Promise<BitgetDryRunResult> {
    const payload = {
      symbol,
      leverage,
      source: "agentguard",
    };
    return this.createDryRunResult("setLeverage", payload);
  }

  /**
   * Close a position in dry-run mode
   * Does NOT call Bitget APIs - returns a BitgetDryRunResult with the payload
   */
  async closePosition(symbol: string): Promise<BitgetDryRunResult> {
    const payload = {
      symbol,
      source: "agentguard",
    };
    return this.createDryRunResult("closePosition", payload);
  }

  /**
   * Cancel an order in dry-run mode
   * Does NOT call Bitget APIs - returns a BitgetDryRunResult with the payload
   */
  async cancelOrder(orderId: string): Promise<BitgetDryRunResult> {
    const payload = {
      orderId,
      source: "agentguard",
    };
    return this.createDryRunResult("cancelOrder", payload);
  }

  /**
   * Convert AgentGuard OrderIntent to Bitget-shaped order payload
   * This is a dry-run shape only - actual Bitget API field mapping comes later
   */
  private toBitgetOrderPayload(order: OrderIntent): Record<string, unknown> {
    return {
      symbol: order.symbol,
      side: order.side,
      orderType: order.orderType,
      size: order.notionalUsd, // Bitget uses "size" for notional in some endpoints
      notionalUsd: order.notionalUsd,
      leverage: order.leverage,
      reduceOnly: order.reduceOnly,
      price: order.price,
      source: "agentguard",
      // Optional metadata passthrough
      ...(order.metadata ? { metadata: order.metadata } : {}),
    };
  }

  /**
   * Create a standardized dry-run result object
   */
  private createDryRunResult(
    operation: BitgetDryRunResult["operation"],
    payload: unknown
  ): BitgetDryRunResult {
    return {
      mode: this.mode,
      status: "dry_run_not_sent",
      operation,
      payload,
      timestamp: new Date().toISOString(),
      note: "Dry run only. No Bitget order was sent.",
    };
  }
}
