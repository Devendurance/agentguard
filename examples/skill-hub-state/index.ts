import {
  AgentGuard,
  createAgentGuardedClient,
  loadPolicy,
  BitgetMcpAdapter,
  MockSkillHubMarketStateProvider,
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
function formatMarketState(ms: {
  symbol: string;
  fundingRate?: number;
  volatilityPct?: number;
  sentiment?: string;
  riskRegime?: string;
  source?: string;
}): string {
  const parts: string[] = [];
  if (ms.riskRegime) parts.push(`regime:${ms.riskRegime}`);
  if (ms.sentiment) parts.push(`sentiment:${ms.sentiment}`);
  if (ms.volatilityPct !== undefined) parts.push(`vol:${ms.volatilityPct}%`);
  if (ms.fundingRate !== undefined) parts.push(`funding:${ms.fundingRate}`);
  if (ms.source) parts.push(`source:${ms.source}`);
  return parts.join(" | ");
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
 * Run the Skill Hub state provider demo
 */
async function main() {
  console.log("AgentGuard Skill Hub State Provider Demo\n");

  // Load policy with marketRisk enabled
  const policy = await loadPolicy("./agentguard.policy.example.json");
  const guard = new AgentGuard({ policy });

  // Create Bitget adapter in dry-run mode
  const bitgetAdapter = new BitgetMcpAdapter({ mode: "dry_run" });

  // Scenario 1: Normal provider - should approve
  console.log("=== Scenario 1: Normal Provider ===");
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
  const marketState1 = await provider1.getMarketState(order1);
  console.log(`Provider scenario: normal`);
  console.log(`Agent requested: ${formatOrder(order1)}`);
  console.log(`Provider returned: ${formatMarketState(marketState1)}`);
  const result1 = await guardedBitget1.placeOrder(order1);
  const forwarded1 = result1.decision.approved && result1.decision.action !== "block";
  console.log(`AgentGuard decision: ${result1.decision.action}`);
  console.log(`Reason: ${result1.decision.reason}`);
  console.log(`Forwarded to Bitget adapter: ${forwarded1}`);
  if (forwarded1) {
    const adapterResult = await bitgetAdapter.placeOrder(
      result1.decision.modifiedOrder ?? order1
    );
    printAdapterResult(adapterResult, true);
  } else {
    printAdapterResult(undefined, false);
  }
  console.log();

  // Scenario 2: Extreme regime provider - should block
  console.log("=== Scenario 2: Extreme Regime Provider ===");
  const provider2 = new MockSkillHubMarketStateProvider({ scenario: "extreme_regime" });
  const guardedBitget2 = createAgentGuardedClient(
    bitgetAdapter,
    guard,
    () => accountState,
    (order) => provider2.getMarketState(order)
  );
  const order2: OrderIntent = {
    symbol: "ETHUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  };
  const marketState2 = await provider2.getMarketState(order2);
  console.log(`Provider scenario: extreme_regime`);
  console.log(`Agent requested: ${formatOrder(order2)}`);
  console.log(`Provider returned: ${formatMarketState(marketState2)}`);
  const result2 = await guardedBitget2.placeOrder(order2);
  const forwarded2 = result2.decision.approved && result2.decision.action !== "block";
  console.log(`AgentGuard decision: ${result2.decision.action}`);
  console.log(`Reason: ${result2.decision.reason}`);
  console.log(`Forwarded to Bitget adapter: ${forwarded2}`);
  if (forwarded2) {
    const adapterResult = await bitgetAdapter.placeOrder(
      result2.decision.modifiedOrder ?? order2
    );
    printAdapterResult(adapterResult, true);
  } else {
    printAdapterResult(undefined, false);
  }
  console.log();

  // Scenario 3: Extreme sentiment provider - should block
  console.log("=== Scenario 3: Extreme Sentiment Provider ===");
  const provider3 = new MockSkillHubMarketStateProvider({ scenario: "extreme_sentiment" });
  const guardedBitget3 = createAgentGuardedClient(
    bitgetAdapter,
    guard,
    () => accountState,
    (order) => provider3.getMarketState(order)
  );
  const order3: OrderIntent = {
    symbol: "SOLUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  };
  const marketState3 = await provider3.getMarketState(order3);
  console.log(`Provider scenario: extreme_sentiment`);
  console.log(`Agent requested: ${formatOrder(order3)}`);
  console.log(`Provider returned: ${formatMarketState(marketState3)}`);
  const result3 = await guardedBitget3.placeOrder(order3);
  const forwarded3 = result3.decision.approved && result3.decision.action !== "block";
  console.log(`AgentGuard decision: ${result3.decision.action}`);
  console.log(`Reason: ${result3.decision.reason}`);
  console.log(`Forwarded to Bitget adapter: ${forwarded3}`);
  if (forwarded3) {
    const adapterResult = await bitgetAdapter.placeOrder(
      result3.decision.modifiedOrder ?? order3
    );
    printAdapterResult(adapterResult, true);
  } else {
    printAdapterResult(undefined, false);
  }
  console.log();

  // Scenario 4: High volatility provider - should block
  console.log("=== Scenario 4: High Volatility Provider ===");
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
  const marketState4 = await provider4.getMarketState(order4);
  console.log(`Provider scenario: high_volatility`);
  console.log(`Agent requested: ${formatOrder(order4)}`);
  console.log(`Provider returned: ${formatMarketState(marketState4)}`);
  const result4 = await guardedBitget4.placeOrder(order4);
  const forwarded4 = result4.decision.approved && result4.decision.action !== "block";
  console.log(`AgentGuard decision: ${result4.decision.action}`);
  console.log(`Reason: ${result4.decision.reason}`);
  console.log(`Forwarded to Bitget adapter: ${forwarded4}`);
  if (forwarded4) {
    const adapterResult = await bitgetAdapter.placeOrder(
      result4.decision.modifiedOrder ?? order4
    );
    printAdapterResult(adapterResult, true);
  } else {
    printAdapterResult(undefined, false);
  }
  console.log();

  // Scenario 5: Funding stress provider - should block
  console.log("=== Scenario 5: Funding Stress Provider ===");
  const provider5 = new MockSkillHubMarketStateProvider({ scenario: "funding_stress" });
  const guardedBitget5 = createAgentGuardedClient(
    bitgetAdapter,
    guard,
    () => accountState,
    (order) => provider5.getMarketState(order)
  );
  const order5: OrderIntent = {
    symbol: "ETHUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  };
  const marketState5 = await provider5.getMarketState(order5);
  console.log(`Provider scenario: funding_stress`);
  console.log(`Agent requested: ${formatOrder(order5)}`);
  console.log(`Provider returned: ${formatMarketState(marketState5)}`);
  const result5 = await guardedBitget5.placeOrder(order5);
  const forwarded5 = result5.decision.approved && result5.decision.action !== "block";
  console.log(`AgentGuard decision: ${result5.decision.action}`);
  console.log(`Reason: ${result5.decision.reason}`);
  console.log(`Forwarded to Bitget adapter: ${forwarded5}`);
  if (forwarded5) {
    const adapterResult = await bitgetAdapter.placeOrder(
      result5.decision.modifiedOrder ?? order5
    );
    printAdapterResult(adapterResult, true);
  } else {
    printAdapterResult(undefined, false);
  }
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
  console.error("Skill Hub state demo failed:", error);
  process.exit(1);
});
