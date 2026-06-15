import {
  AgentGuard,
  createAgentGuardedClient,
  loadPolicy,
  BitgetMcpAdapter,
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
 * Format order for clean console output
 */
function formatOrder(order: OrderIntent): string {
  return `${order.symbol} ${order.side} ${order.orderType} $${order.notionalUsd} ${order.leverage}x`;
}

/**
 * Format market state for display
 */
function formatMarketState(ms: MarketState): string {
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
 * Run the market-risk integration demo
 */
async function main() {
  console.log("AgentGuard Market-Risk Policy Demo\n");

  // Load policy with marketRisk enabled
  const policy = await loadPolicy("./agentguard.policy.example.json");
  const guard = new AgentGuard({ policy });

  // Create Bitget adapter in dry-run mode
  const bitgetAdapter = new BitgetMcpAdapter({ mode: "dry_run" });

  // Create guarded client wrapper
  const guardedBitget = createAgentGuardedClient(
    bitgetAdapter,
    guard,
    () => accountState,
    (order) => {
      // Market state provider will be overridden per-scenario in this demo
      return {
        symbol: order.symbol,
        fundingRate: 0.01,
        volatilityPct: 2.5,
        sentiment: "neutral" as const,
        riskRegime: "normal" as const,
        source: "mock" as const,
      };
    }
  );

  // Scenario 1: Normal BTC market - should approve
  console.log("=== Scenario 1: Normal BTC Market ===");
  const order1: OrderIntent = {
    symbol: "BTCUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  };
  const marketState1: MarketState = {
    symbol: "BTCUSDT",
    riskRegime: "normal",
    sentiment: "neutral",
    fundingRate: 0.01,
    volatilityPct: 2.5,
    source: "mock",
  };
  console.log(`Agent requested: ${formatOrder(order1)}`);
  console.log(`Market state: ${formatMarketState(marketState1)}`);
  const result1 = await guard.evaluateOrder(order1, accountState, marketState1);
  const forwarded1 = result1.approved && result1.action !== "block";
  console.log(`AgentGuard decision: ${result1.action}`);
  console.log(`Reason: ${result1.reason}`);
  console.log(`Forwarded to Bitget adapter: ${forwarded1}`);
  if (forwarded1) {
    const adapterResult = await bitgetAdapter.placeOrder(
      result1.modifiedOrder ?? order1
    );
    printAdapterResult(adapterResult, true);
  } else {
    printAdapterResult(undefined, false);
  }
  console.log();

  // Scenario 2: Extreme regime ETH - should block
  console.log("=== Scenario 2: Extreme Regime ETH ===");
  const order2: OrderIntent = {
    symbol: "ETHUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  };
  const marketState2: MarketState = {
    symbol: "ETHUSDT",
    riskRegime: "extreme",
    sentiment: "neutral",
    fundingRate: 0.01,
    volatilityPct: 2.5,
    source: "bitget-skill-hub",
  };
  console.log(`Agent requested: ${formatOrder(order2)}`);
  console.log(`Market state: ${formatMarketState(marketState2)}`);
  const result2 = await guard.evaluateOrder(order2, accountState, marketState2);
  const forwarded2 = result2.approved && result2.action !== "block";
  console.log(`AgentGuard decision: ${result2.action}`);
  console.log(`Reason: ${result2.reason}`);
  console.log(`Forwarded to Bitget adapter: ${forwarded2}`);
  if (forwarded2) {
    const adapterResult = await bitgetAdapter.placeOrder(
      result2.modifiedOrder ?? order2
    );
    printAdapterResult(adapterResult, true);
  } else {
    printAdapterResult(undefined, false);
  }
  console.log();

  // Scenario 3: Extreme sentiment SOL - should block
  console.log("=== Scenario 3: Extreme Sentiment SOL ===");
  const order3: OrderIntent = {
    symbol: "SOLUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  };
  const marketState3: MarketState = {
    symbol: "SOLUSDT",
    riskRegime: "elevated",
    sentiment: "extreme_fear",
    fundingRate: 0.01,
    volatilityPct: 2.5,
    source: "bitget-skill-hub",
  };
  console.log(`Agent requested: ${formatOrder(order3)}`);
  console.log(`Market state: ${formatMarketState(marketState3)}`);
  const result3 = await guard.evaluateOrder(order3, accountState, marketState3);
  const forwarded3 = result3.approved && result3.action !== "block";
  console.log(`AgentGuard decision: ${result3.action}`);
  console.log(`Reason: ${result3.reason}`);
  console.log(`Forwarded to Bitget adapter: ${forwarded3}`);
  if (forwarded3) {
    const adapterResult = await bitgetAdapter.placeOrder(
      result3.modifiedOrder ?? order3
    );
    printAdapterResult(adapterResult, true);
  } else {
    printAdapterResult(undefined, false);
  }
  console.log();

  // Scenario 4: High volatility BTC - should block
  console.log("=== Scenario 4: High Volatility BTC ===");
  const order4: OrderIntent = {
    symbol: "BTCUSDT",
    side: "buy",
    orderType: "market",
    notionalUsd: 180,
    leverage: 3,
  };
  const marketState4: MarketState = {
    symbol: "BTCUSDT",
    riskRegime: "elevated",
    sentiment: "neutral",
    fundingRate: 0.01,
    volatilityPct: 12,
    source: "technical-analysis",
  };
  console.log(`Agent requested: ${formatOrder(order4)}`);
  console.log(`Market state: ${formatMarketState(marketState4)}`);
  const result4 = await guard.evaluateOrder(order4, accountState, marketState4);
  const forwarded4 = result4.approved && result4.action !== "block";
  console.log(`AgentGuard decision: ${result4.action}`);
  console.log(`Reason: ${result4.reason}`);
  console.log(`Forwarded to Bitget adapter: ${forwarded4}`);
  if (forwarded4) {
    const adapterResult = await bitgetAdapter.placeOrder(
      result4.modifiedOrder ?? order4
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
  console.error("Market-risk demo failed:", error);
  process.exit(1);
});
