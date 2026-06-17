import {
  AgentGuard,
  BitgetMcpAdapter,
  createAgentGuardedClient,
  loadPolicy,
  MockSkillHubMarketStateProvider,
  buildDashboardDataset,
  OrderIntent,
  AccountState,
} from "../../packages/sdk/src";

import { writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";

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
 * Run the dashboard data generation demo
 */
async function main() {
  console.log("AgentGuard Dashboard Data Foundation Demo\n");

  // Load policy with marketRisk enabled
  const policy = await loadPolicy("./agentguard.policy.example.json");
  const guard = new AgentGuard({ policy });

  // Create Bitget adapter in dry-run mode
  const bitgetAdapter = new BitgetMcpAdapter({ mode: "dry_run" });

  // Scenario 1: Safe BTC order with normal provider ? approve
  console.log("=== Scenario 1: Safe BTC Order ===");
  const provider1 = new MockSkillHubMarketStateProvider({ scenario: "normal" });
  const guardedBitget1 = createAgentGuardedClient(
    bitgetAdapter,
    guard,
    () => accountState,
    (order) => provider1.getMarketState(order)
  );
  const order1: OrderIntent = {
    symbol: "BTCUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  };
  await guardedBitget1.placeOrder(order1);
  console.log(`  Requested: ${formatOrder(order1)}`);
  console.log(`  Result: approve, forwarded to dry-run adapter`);
  console.log();

  // Scenario 2: Oversized SOL order with normal provider ? resize
  console.log("=== Scenario 2: Oversized SOL Order ===");
  const provider2 = new MockSkillHubMarketStateProvider({ scenario: "normal" });
  const guardedBitget2 = createAgentGuardedClient(
    bitgetAdapter,
    guard,
    () => accountState,
    (order) => provider2.getMarketState(order)
  );
  const order2: OrderIntent = {
    symbol: "SOLUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 800,
    leverage: 4,
  };
  await guardedBitget2.placeOrder(order2);
  console.log(`  Requested: ${formatOrder(order2)}`);
  console.log(`  Result: resize to $250, forwarded to dry-run adapter`);
  console.log();

  // Scenario 3: Overleveraged ETH order with normal provider ? block
  console.log("=== Scenario 3: Overleveraged ETH Order ===");
  const provider3 = new MockSkillHubMarketStateProvider({ scenario: "normal" });
  const guardedBitget3 = createAgentGuardedClient(
    bitgetAdapter,
    guard,
    () => accountState,
    (order) => provider3.getMarketState(order)
  );
  const order3: OrderIntent = {
    symbol: "ETHUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 200,
    leverage: 20,
  };
  await guardedBitget3.placeOrder(order3);
  console.log(`  Requested: ${formatOrder(order3)}`);
  console.log(`  Result: block (max_leverage_exceeded)`);
  console.log();

  // Scenario 4: BTC order with high_volatility provider ? block
  console.log("=== Scenario 4: High Volatility BTC ===");
  const provider4 = new MockSkillHubMarketStateProvider({ scenario: "high_volatility" });
  const guardedBitget4 = createAgentGuardedClient(
    bitgetAdapter,
    guard,
    () => accountState,
    (order) => provider4.getMarketState(order)
  );
  const order4: OrderIntent = {
    symbol: "BTCUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  };
  await guardedBitget4.placeOrder(order4);
  console.log(`  Requested: ${formatOrder(order4)}`);
  console.log(`  Result: block (volatility_stress)`);
  console.log();

  // Scenario 5: SOL order with extreme_sentiment provider ? block
  console.log("=== Scenario 5: Extreme Sentiment SOL ===");
  const provider5 = new MockSkillHubMarketStateProvider({ scenario: "extreme_sentiment" });
  const guardedBitget5 = createAgentGuardedClient(
    bitgetAdapter,
    guard,
    () => accountState,
    (order) => provider5.getMarketState(order)
  );
  const order5: OrderIntent = {
    symbol: "SOLUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  };
  await guardedBitget5.placeOrder(order5);
  console.log(`  Requested: ${formatOrder(order5)}`);
  console.log(`  Result: block (extreme_sentiment)`);
  console.log();

  // Build dashboard dataset from collected events
  const events = guard.getEvents();
  const dataset = buildDashboardDataset(events, policy);

  // Ensure data directory exists
  const dataDir = join(process.cwd(), "data");
  await mkdir(dataDir, { recursive: true });

  // Write JSON output file
  const outputPath = join(dataDir, "agentguard-dashboard-sample.json");
  await writeFile(outputPath, JSON.stringify(dataset, null, 2), "utf-8");

  // Print dashboard metrics summary
  console.log("=== Dashboard Metrics Summary ===");
  console.log(`Generated at: ${dataset.generatedAt}`);
  console.log(`Orders evaluated: ${dataset.metrics.ordersEvaluated}`);
  console.log(`Approved: ${dataset.metrics.approved}`);
  console.log(`Resized: ${dataset.metrics.resized}`);
  console.log(`Blocked: ${dataset.metrics.blocked}`);
  console.log(`Flattened: ${dataset.metrics.flattened}`);
  console.log(`Paused: ${dataset.metrics.paused}`);
  console.log(`Market-risk blocks: ${dataset.metrics.marketRiskBlocks}`);
  console.log(`Forwarded to execution: ${dataset.metrics.forwardedToExecution}`);
  console.log(`Blocked before execution: ${dataset.metrics.blockedBeforeExecution}`);
  console.log(`Approval rate: ${dataset.metrics.approvalRatePct}%`);
  console.log(`Current risk mode: ${dataset.metrics.currentRiskMode}`);
  console.log(`Policy health: ${dataset.metrics.policyHealth}`);
  console.log();

  // Print output info
  console.log("=== Output ===");
  console.log(`Events exported: ${dataset.events.length}`);
  console.log(`Output file: ${outputPath}`);
  console.log("Dashboard data foundation ready for Phase 4 UI integration.");
}

// Run demo with error handling
main().catch((error) => {
  console.error("Dashboard data demo failed:", error);
  process.exit(1);
});
