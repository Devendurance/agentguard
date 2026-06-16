import {
  AgentGuard,
  BitgetMcpAdapter,
  createAgentGuardedClient,
  loadPolicy,
  BitgetPublicMarketStateProvider,
  OrderIntent,
  AccountState,
} from "../../packages/sdk/src";

/**
 * Sample account state for demo evaluation
 */
const accountState: AccountState = {
  equityUsd: 10000,
  dailyPnlUsd: -100,
  dailyDrawdownPct: 1,
  totalDrawdownPct: 2,
  openExposureUsd: 500,
  symbolExposureUsd: {
    BTCUSDT: 200,
    ETHUSDT: 200,
    SOLUSDT: 100,
  },
};

/**
 * Format order for clean console output
 */
function formatOrder(order: OrderIntent): string {
  return `${order.symbol} ${order.side} ${order.orderType} $${order.notionalUsd} ${order.leverage}x`;
}

/**
 * Format market state for display
 */
function formatMarketState(state: any): string {
  const parts = [
    `regime:${state.riskRegime}`,
    `sentiment:${state.sentiment}`,
  ];
  if (state.volatilityPct !== undefined) parts.push(`vol:${state.volatilityPct.toFixed(1)}%`);
  if (state.fundingRate !== undefined) parts.push(`funding:${state.fundingRate}`);
  parts.push(`source:${state.source}`);
  return parts.join(" | ");
}

/**
 * Run the Bitget public market data demo
 */
async function main() {
  console.log("AgentGuard + Bitget Public Market Data Demo\n");
  console.log("Note: This demo uses ONLY public read-only Bitget APIs.\n");
  console.log("No credentials, no private endpoints, no order execution.\n");

  // Load policy with marketRisk enabled
  const policy = await loadPolicy("./agentguard.policy.example.json");
  const guard = new AgentGuard({ policy });

  // Create Bitget adapter in dry-run mode
  const bitgetAdapter = new BitgetMcpAdapter({ mode: "dry_run" });

  // Create public market provider
  const marketProvider = new BitgetPublicMarketStateProvider({
    fallbackOnError: true, // Safe fallback if API unavailable
  });

  // Order 1: BTCUSDT buy market $180 3x
  console.log("=== Order 1: BTCUSDT ===");
  const order1: OrderIntent = {
    symbol: "BTCUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  };
  
  // Fetch real market state from Bitget public API
  const marketState1 = await marketProvider.getMarketState(order1);
  console.log(`Agent requested: ${formatOrder(order1)}`);
  console.log(`Real market state: ${formatMarketState(marketState1)}`);
  
  // Create guarded client with market state provider
  const guardedBitget1 = createAgentGuardedClient(
    bitgetAdapter,
    guard,
    () => accountState,
    () => marketState1
  );
  
  // Evaluate order through AgentGuard
  const result1 = await guardedBitget1.placeOrder(order1);
  console.log(`AgentGuard decision: ${result1.decision.action}`);
  console.log(`Reason: ${result1.decision.reason}`);
  console.log(`Forwarded to Bitget dry-run adapter: ${result1.forwarded}`);
  if (result1.forwarded) {
    console.log(`Adapter result: ${result1.executionResult}`);
  }
  console.log();

  // Order 2: ETHUSDT buy market $180 3x
  console.log("=== Order 2: ETHUSDT ===");
  const order2: OrderIntent = {
    symbol: "ETHUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  };
  
  // Fetch real market state from Bitget public API
  const marketState2 = await marketProvider.getMarketState(order2);
  console.log(`Agent requested: ${formatOrder(order2)}`);
  console.log(`Real market state: ${formatMarketState(marketState2)}`);
  
  // Create guarded client with market state provider
  const guardedBitget2 = createAgentGuardedClient(
    bitgetAdapter,
    guard,
    () => accountState,
    () => marketState2
  );
  
  // Evaluate order through AgentGuard
  const result2 = await guardedBitget2.placeOrder(order2);
  console.log(`AgentGuard decision: ${result2.decision.action}`);
  console.log(`Reason: ${result2.decision.reason}`);
  console.log(`Forwarded to Bitget dry-run adapter: ${result2.forwarded}`);
  if (result2.forwarded) {
    console.log(`Adapter result: ${result2.executionResult}`);
  }
  console.log();

  // Print AgentGuard event log summary
  console.log("=== AgentGuard Event Log ===");
  const events = guard.getEvents();
  events.forEach((event, idx) => {
    console.log(`[${idx + 1}] ${new Date(event.timestamp).toLocaleTimeString()} | ${event.order.symbol} | ${event.decision.action} | ${event.decision.reason}`);
  });
  console.log(`\nTotal events logged: ${events.length}`);
  
  // Summary
  console.log("\n=== Demo Summary ===");
  console.log("✓ Used Bitget public read-only APIs only");
  console.log("✓ No credentials or API keys required");
  console.log("✓ No private/order/account endpoints called");
  console.log("✓ BitgetMcpAdapter in dry_run mode (no live trades)");
  console.log("✓ Fallback behavior enabled for API resilience");
  console.log("\nPhase 5B: Real read-only market data integration complete.");
}

// Run demo with error handling
main().catch((error) => {
  console.error("Bitget public market demo failed:", error);
  process.exit(1);
});
