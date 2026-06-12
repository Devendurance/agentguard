import {
  AgentGuard,
  createAgentGuardedClient,
  loadPolicy,
  ExecutionClient,
  OrderIntent,
  AccountState,
} from "../../packages/sdk/src";

/**
 * Mock Bitget-shaped execution client for local testing
 * Does NOT call real Bitget APIs or use API keys
 */
const mockBitgetClient: ExecutionClient = {
  async placeOrder(order: OrderIntent) {
    return {
      status: "mock_order_sent",
      order,
      exchange: "bitget_mock",
    };
  },
};

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
  return `${order.symbol} ${order.side} $${order.notionalUsd} ${order.leverage}x`;
}

/**
 * Run the basic-wrapper demo
 */
async function main() {
  console.log("???  AgentGuard Basic Wrapper Demo\n");

  // Load policy from example config
  const policy = await loadPolicy("./agentguard.policy.example.json");
  const guard = new AgentGuard({ policy });

  // Create guarded client wrapper
  const guardedBitget = createAgentGuardedClient(
    mockBitgetClient,
    guard,
    () => accountState,
    (order) => ({
      symbol: order.symbol,
      fundingRate: 0.01,
      volatilityPct: 2.5,
      sentiment: "neutral" as const,
      riskRegime: "normal" as const,
      source: "mock" as const,
    })
  );

  // Demo Order 1: Safe BTC order - should be approved
  console.log("=== Scenario 1: Safe BTC Order ===");
  const order1: OrderIntent = {
    symbol: "BTCUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  };
  console.log(`Original: ${formatOrder(order1)}`);
  const result1 = await guardedBitget.placeOrder(order1);
  console.log(`Decision: ${result1.decision.action}`);
  console.log(`Reason: ${result1.decision.reason}`);
  console.log(`Forwarded to execution: ${result1.forwarded}`);
  if (result1.executionResult) {
    console.log(`Execution result: ${(result1.executionResult as any).status}`);
  }
  console.log();

  // Demo Order 2: Oversized SOL order - should be resized to $250
  console.log("=== Scenario 2: Oversized SOL Order ===");
  const order2: OrderIntent = {
    symbol: "SOLUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 800,
    leverage: 4,
  };
  console.log(`Original: ${formatOrder(order2)}`);
  const result2 = await guardedBitget.placeOrder(order2);
  console.log(`Decision: ${result2.decision.action}`);
  console.log(`Reason: ${result2.decision.reason}`);
  console.log(`Forwarded to execution: ${result2.forwarded}`);
  if (result2.decision.modifiedOrder) {
    console.log(
      `Modified order: ${formatOrder(result2.decision.modifiedOrder)}`
    );
  }
  if (result2.executionResult) {
    console.log(`Execution result: ${(result2.executionResult as any).status}`);
  }
  console.log();

  // Demo Order 3: Overleveraged ETH order - should be blocked
  console.log("=== Scenario 3: Overleveraged ETH Order ===");
  const order3: OrderIntent = {
    symbol: "ETHUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 200,
    leverage: 20,
  };
  console.log(`Original: ${formatOrder(order3)}`);
  const result3 = await guardedBitget.placeOrder(order3);
  console.log(`Decision: ${result3.decision.action}`);
  console.log(`Reason: ${result3.decision.reason}`);
  console.log(`Forwarded to execution: ${result3.forwarded}`);
  console.log();

  // Demo Order 4: Unsupported DOGE order - should be blocked
  console.log("=== Scenario 4: Unsupported DOGE Order ===");
  const order4: OrderIntent = {
    symbol: "DOGEUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 100,
    leverage: 2,
  };
  console.log(`Original: ${formatOrder(order4)}`);
  const result4 = await guardedBitget.placeOrder(order4);
  console.log(`Decision: ${result4.decision.action}`);
  console.log(`Reason: ${result4.decision.reason}`);
  console.log(`Forwarded to execution: ${result4.forwarded}`);
  console.log();

  // Print event log summary
  console.log("=== AgentGuard Event Log ===");
  const events = guard.getEvents();
  events.forEach((event, i) => {
    console.log(
      `[${i + 1}] ${new Date(event.timestamp).toLocaleTimeString()} | ${
        event.order.symbol
      } | ${event.decision.action} | ${event.decision.reason}`
    );
  });
  console.log(`\nTotal events logged: ${events.length}`);
}

// Run demo with error handling
main().catch((error) => {
  console.error("Demo failed:", error);
  process.exit(1);
});
