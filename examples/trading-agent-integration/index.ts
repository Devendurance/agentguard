import {
  AgentGuard,
  BitgetMcpAdapter,
  BitgetPublicMarketStateProvider,
  createAgentGuardedClient,
  loadPolicy,
  OrderIntent,
  AccountState,
  MarketState,
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
 * Simple mock trading agent that generates order intents from prompts
 * In production, this would be an LLM/agent generating trade ideas
 */
function generateAgentOrder(prompt: string): OrderIntent {
  const prompts: Record<string, OrderIntent> = {
    "buy btc safely": {
      symbol: "BTCUSDT",
      side: "buy",
      orderType: "market",
      notionalUsd: 180,
      leverage: 3,
    },
    "ape into sol": {
      symbol: "SOLUSDT",
      side: "buy",
      orderType: "market",
      notionalUsd: 800,
      leverage: 4,
    },
    "long eth 20x": {
      symbol: "ETHUSDT",
      side: "buy",
      orderType: "market",
      notionalUsd: 200,
      leverage: 20,
    },
    "buy doge": {
      symbol: "DOGEUSDT",
      side: "buy",
      orderType: "market",
      notionalUsd: 100,
      leverage: 2,
    },
  };
  return prompts[prompt.toLowerCase()] ?? {
    symbol: "BTCUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 100,
    leverage: 1,
  };
}

/**
 * Format order for clean console output
 */
function formatOrder(order: OrderIntent): string {
  return `${order.symbol} ${order.side} ${order.orderType} $${order.notionalUsd} ${order.leverage}x`;
}

/**
 * Format market state for display
 */
function formatMarketState(state: MarketState): string {
  const parts = [`source:${state.source}`];
  if (state.volatilityPct !== undefined) parts.push(`vol:${state.volatilityPct.toFixed(1)}%`);
  if (state.fundingRate !== undefined) parts.push(`funding:${state.fundingRate}`);
  if (state.riskRegime) parts.push(`regime:${state.riskRegime}`);
  return parts.join(" | ");
}

/**
 * Run the trading agent integration demo
 */
async function main() {
  console.log("AgentGuard Trading Agent Integration Demo\n");
  console.log("This demo shows how an AI/trading agent integrates AgentGuard.\n");

  // Load policy with marketRisk enabled
  const policy = await loadPolicy("./agentguard.policy.example.json");
  const guard = new AgentGuard({ policy });

  // Create market provider (real public Bitget APIs)
  const marketProvider = new BitgetPublicMarketStateProvider({ fallbackOnError: true });

  // Create execution client (dry-run mode - no live trades)
  const executionClient = new BitgetMcpAdapter({ mode: "dry_run" });

  // Create guarded client that wraps execution with AgentGuard
  const guardedBitget = createAgentGuardedClient(
    executionClient,
    guard,
    () => accountState,
    (order) => marketProvider.getMarketState(order)
  );

  // Test prompts simulating agent-generated trade ideas
  const testPrompts = [
    "buy btc safely",
    "ape into sol",
    "long eth 20x",
    "buy doge",
  ];

  for (const prompt of testPrompts) {
    console.log(`\n--- Prompt: "${prompt}" ---`);

    // Agent generates order intent
    const order = generateAgentOrder(prompt);
    console.log(`Agent generated: ${formatOrder(order)}`);

    // Fetch real market state from Bitget public API
    const marketState = await marketProvider.getMarketState(order);
    console.log(`Market state: ${formatMarketState(marketState)}`);

    // Evaluate order through AgentGuard
    const result = await guardedBitget.placeOrder(order);
    console.log(`AgentGuard decision: ${result.decision.action}`);
    console.log(`Reason: ${result.decision.reason}`);
    console.log(`Forwarded to Bitget adapter: ${result.forwarded}`);

    if (result.forwarded) {
      // Print adapter payload as JSON (not [object Object])
      const payload = {
        symbol: order.symbol,
        side: order.side,
        orderType: order.orderType,
        size: order.notionalUsd,
        notionalUsd: order.notionalUsd,
        leverage: order.leverage,
        source: "agentguard",
      };
      console.log(`Adapter payload: ${JSON.stringify(payload, null, 2)}`);
      console.log(`Adapter result: ${result.executionResult}`);
    } else {
      console.log("Execution skipped by AgentGuard.");
    }
  }

  // Print audit log summary
  console.log("\n=== Audit Log ===");
  const events = guard.getEvents();
  events.forEach((event) => {
    const time = new Date(event.timestamp).toLocaleTimeString();
    console.log(`[${time}] ${event.order.symbol} | ${event.decision.action} | ${event.decision.reason} | ${event.marketState?.source ?? "unknown"}`);
  });

  // Print integration takeaway
  console.log("\n=== Integration Takeaway ===");
  console.log("AgentGuard wraps the execution client, not the agent brain.");
  console.log("The agent can generate intents, but AgentGuard decides what is allowed to reach execution.");
  console.log("\nKey points:");
  console.log("• Agent generates OrderIntent based on strategy/LLM");
  console.log("• AgentGuard loads policy and evaluates before execution");
  console.log("• Market provider supplies real risk state (public APIs)");
  console.log("• Execution adapter only receives approved/resized orders");
  console.log("• Every decision is logged for audit/replay");

  // Summary
  console.log("\n=== Demo Summary ===");
  console.log("✓ Used Bitget public read-only APIs for market data");
  console.log("✓ No credentials or API keys required");
  console.log("✓ No private/order/account endpoints called");
  console.log("✓ BitgetMcpAdapter in dry_run mode (no live trades)");
  console.log("✓ Fallback behavior enabled for API resilience");
  console.log("\nPhase 5C: Trading agent integration demo complete.");
}

// Run demo with error handling
main().catch((error) => {
  console.error("Trading agent integration demo failed:", error);
  process.exit(1);
});
