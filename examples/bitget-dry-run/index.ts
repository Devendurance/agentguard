import {
  AgentGuard,
  createAgentGuardedClient,
  loadPolicy,
  BitgetMcpAdapter,
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
 * Market state provider - returns mock market data for risk evaluation
 */
function marketStateProvider(order: OrderIntent) {
  return {
    symbol: order.symbol,
    fundingRate: 0.01,
    volatilityPct: 2.5,
    sentiment: "neutral" as const,
    riskRegime: "normal" as const,
    source: "mock" as const,
  };
}

/**
 * Format order for clean console output
 */
function formatOrder(order: OrderIntent): string {
  return `${order.symbol} ${order.side} ${order.orderType} $${order.notionalUsd} ${order.leverage}x`;
}

/**
 * Print adapter result details when order is forwarded
 */
function printAdapterResult(result: unknown, forwarded: boolean): void {
  if (!forwarded) {
    console.log("  Adapter call skipped by AgentGuard.");
    return;
  }

  const adapterResult = result as {
    mode: string;
    status: string;
    operation: string;
    payload: unknown;
    timestamp: string;
    note: string;
  };

  console.log(`  Adapter mode: ${adapterResult.mode}`);
  console.log(`  Adapter status: ${adapterResult.status}`);
  console.log(`  Adapter operation: ${adapterResult.operation}`);
  console.log(`  Bitget-shaped payload: ${JSON.stringify(adapterResult.payload, null, 2)}`);
  console.log(`  Note: ${adapterResult.note}`);
}

/**
 * Run the Bitget dry-run integration demo
 */
async function main() {
  console.log("AgentGuard + BitgetMcpAdapter Dry-Run Demo\n");

  // Load policy from example config (relative to project root)
  const policy = await loadPolicy("./agentguard.policy.example.json");
  const guard = new AgentGuard({ policy });

  // Create Bitget adapter in dry-run mode (default)
  const bitgetAdapter = new BitgetMcpAdapter({ mode: "dry_run" });

  // Create guarded client wrapper with Bitget adapter
  const guardedBitget = createAgentGuardedClient(
    bitgetAdapter,
    guard,
    () => accountState,
    marketStateProvider
  );

  // Demo Order 1: Safe BTC order - should be approved and forwarded
  console.log("=== Scenario 1: Safe BTC Order ===");
  console.log(`Agent requested: ${formatOrder({
    symbol: "BTCUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  })}`);
  const result1 = await guardedBitget.placeOrder({
    symbol: "BTCUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  });
  console.log(`AgentGuard decision: ${result1.decision.action}`);
  console.log(`Reason: ${result1.decision.reason}`);
  console.log(`Forwarded to Bitget adapter: ${result1.forwarded}`);
  printAdapterResult(result1.executionResult, result1.forwarded);
  console.log();

  // Demo Order 2: Oversized SOL order - should be resized and forwarded with modified order
  console.log("=== Scenario 2: Oversized SOL Order ===");
  console.log(`Agent requested: ${formatOrder({
    symbol: "SOLUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 800,
    leverage: 4,
  })}`);
  const result2 = await guardedBitget.placeOrder({
    symbol: "SOLUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 800,
    leverage: 4,
  });
  console.log(`AgentGuard decision: ${result2.decision.action}`);
  console.log(`Reason: ${result2.decision.reason}`);
  console.log(`Forwarded to Bitget adapter: ${result2.forwarded}`);
  if (result2.decision.modifiedOrder) {
    console.log(`  Modified order sent to adapter: ${formatOrder(result2.decision.modifiedOrder)}`);
  }
  printAdapterResult(result2.executionResult, result2.forwarded);
  console.log();

  // Demo Order 3: Overleveraged ETH order - should be blocked, adapter not called
  console.log("=== Scenario 3: Overleveraged ETH Order ===");
  console.log(`Agent requested: ${formatOrder({
    symbol: "ETHUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 200,
    leverage: 20,
  })}`);
  const result3 = await guardedBitget.placeOrder({
    symbol: "ETHUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 200,
    leverage: 20,
  });
  console.log(`AgentGuard decision: ${result3.decision.action}`);
  console.log(`Reason: ${result3.decision.reason}`);
  console.log(`Forwarded to Bitget adapter: ${result3.forwarded}`);
  printAdapterResult(result3.executionResult, result3.forwarded);
  console.log();

  // Demo Order 4: Unsupported DOGE order - should be blocked, adapter not called
  console.log("=== Scenario 4: Unsupported DOGE Order ===");
  console.log(`Agent requested: ${formatOrder({
    symbol: "DOGEUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 100,
    leverage: 2,
  })}`);
  const result4 = await guardedBitget.placeOrder({
    symbol: "DOGEUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 100,
    leverage: 2,
  });
  console.log(`AgentGuard decision: ${result4.decision.action}`);
  console.log(`Reason: ${result4.decision.reason}`);
  console.log(`Forwarded to Bitget adapter: ${result4.forwarded}`);
  printAdapterResult(result4.executionResult, result4.forwarded);
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
  console.error("Bitget dry-run demo failed:", error);
  process.exit(1);
});
