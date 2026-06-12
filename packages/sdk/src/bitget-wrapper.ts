import {
  OrderIntent,
  AccountState,
  MarketState,
  ExecutionClient,
  GuardDecision,
} from "./types";
import { AgentGuard } from "./guard";

/**
 * Provider function type for fetching current account state
 */
export type AccountStateProvider =
  | (() => Promise<AccountState | undefined>)
  | (() => AccountState | undefined);

/**
 * Provider function type for fetching market state for a given order
 */
export type MarketStateProvider =
  | ((order: OrderIntent) => Promise<MarketState | undefined>)
  | ((order: OrderIntent) => MarketState | undefined);

/**
 * Result of a guarded order execution attempt
 */
export interface GuardedExecutionResult {
  decision: GuardDecision;
  executionResult?: unknown;
  forwarded: boolean;
}

/**
 * Create a guarded execution client that wraps any ExecutionClient
 * with AgentGuard risk evaluation before order forwarding
 *
 * The executionClient can be:
 * - Mock local client (for testing)
 * - Real Bitget API client
 * - Bitget MCP adapter
 * - Agent Hub tool caller
 */
export function createAgentGuardedClient(
  executionClient: ExecutionClient,
  guard: AgentGuard,
  accountStateProvider: AccountStateProvider,
  marketStateProvider: MarketStateProvider
) {
  return {
    /**
     * Place an order after risk evaluation
     * Returns decision, optional execution result, and whether order was forwarded
     */
    async placeOrder(order: OrderIntent): Promise<GuardedExecutionResult> {
      // Step 1: Fetch current state
      const accountState = await Promise.resolve(accountStateProvider());
      const marketState = await Promise.resolve(marketStateProvider(order));

      // Step 2: Evaluate order against policy
      const decision = await guard.evaluateOrder(order, accountState, marketState);

      // Step 3: Handle decision action
      switch (decision.action) {
        case "approve": {
          const executionResult = await executionClient.placeOrder(order);
          return { decision, executionResult, forwarded: true };
        }

        case "resize": {
          if (decision.modifiedOrder) {
            const executionResult = await executionClient.placeOrder(
              decision.modifiedOrder
            );
            return { decision, executionResult, forwarded: true };
          }
          // modifiedOrder missing - do not forward
          return { decision, forwarded: false };
        }

        case "block":
        case "flatten":
        case "pause": {
          // Do not forward new exposure
          return { decision, forwarded: false };
        }

        case "reduce_only": {
          // For MVP: only forward if order is already reduce-only
          if (order.reduceOnly === true) {
            const executionResult = await executionClient.placeOrder(order);
            return { decision, executionResult, forwarded: true };
          }
          return { decision, forwarded: false };
        }

        default: {
          // Unknown action - treat as block for safety
          return { decision, forwarded: false };
        }
      }
    },

    /**
     * Cancel an order - passthrough to execution client
     */
    async cancelOrder(orderId: string): Promise<unknown> {
      if (!executionClient.cancelOrder) {
        throw new Error("Execution client does not support cancelOrder");
      }
      return executionClient.cancelOrder(orderId);
    },

    /**
     * Close a position - passthrough to execution client
     */
    async closePosition(symbol: string): Promise<unknown> {
      if (!executionClient.closePosition) {
        throw new Error("Execution client does not support closePosition");
      }
      return executionClient.closePosition(symbol);
    },

    /**
     * Set leverage - passthrough to execution client (not guarded in MVP)
     * Note: Leverage changes could be guarded in a future version
     */
    async setLeverage(symbol: string, leverage: number): Promise<unknown> {
      if (!executionClient.setLeverage) {
        throw new Error("Execution client does not support setLeverage");
      }
      return executionClient.setLeverage(symbol, leverage);
    },
  };
}
