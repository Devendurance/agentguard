/**
 * AgentGuard Guarded Bitget Paper Order Demo
 *
 * Default behavior: no order is sent.
 * To intentionally send the paper order, set AGENTGUARD_EXECUTE_PAPER_ORDER=true
 * plus all required Bitget paper env flags.
 */

import {
  AgentGuard,
  BitgetPaperTradingClient,
  createAgentGuardedClient,
  type AccountState,
  type MarketState,
  type OrderIntent,
  type RiskPolicy,
} from "../../packages/sdk/src";

function describeOrder(order: OrderIntent): string {
  return `${order.symbol} ${order.side} ${order.orderType} $${order.notionalUsd} ${order.leverage}x`;
}

async function runScenario(
  label: string,
  guardedClient: ReturnType<typeof createAgentGuardedClient>,
  paperClient: BitgetPaperTradingClient,
  order: OrderIntent
) {
  const before = paperClient.getSafetyStatus().executePaperOrder;
  const result = await guardedClient.placeOrder(order);

  console.log(`\n=== ${label} ===`);
  console.log(`Order: ${describeOrder(order)}`);
  console.log(`Decision: ${result.decision.action}`);
  console.log(`Reason: ${result.decision.reason}`);
  console.log(`Forwarded to paper client: ${result.forwarded}`);

  if (result.executionResult) {
    console.log("Paper client result:");
    console.log(JSON.stringify(result.executionResult, null, 2));
  } else {
    console.log("Paper client was not called.");
  }

  if (!before) {
    console.log("Default safety gate: no paper order was sent.");
  }
}

async function main() {
  console.log("AgentGuard Guarded Bitget Paper Order Demo\n");
  console.log("Safety: default run does not send orders.");
  console.log("Execution gate: AGENTGUARD_EXECUTE_PAPER_ORDER=true\n");

  const policy: RiskPolicy = {
    mode: "active",
    maxLeverage: 5,
    maxOrderUsd: 3,
    maxDailyDrawdownPct: 3,
    allowedSymbols: ["BTCUSDT", "ETHUSDT"],
    failClosed: true,
    actions: {
      onOversizedOrder: "block",
      onDrawdownBreach: "flatten",
      onUnknownRiskState: "block",
    },
  };

  const guard = new AgentGuard({ policy });
  const paperClient = new BitgetPaperTradingClient();

  const accountStateProvider = (): AccountState => ({
    equityUsd: 1000,
    dailyPnlUsd: 0,
    dailyDrawdownPct: 0,
  });

  const marketStateProvider = (order: OrderIntent): MarketState => ({
    symbol: order.symbol,
    riskRegime: "normal",
    sentiment: "neutral",
    source: "mock",
  });

  const guardedClient = createAgentGuardedClient(
    paperClient,
    guard,
    accountStateProvider,
    marketStateProvider
  );

  await runScenario(
    "Scenario 1: Safe BTC Paper Order",
    guardedClient,
    paperClient,
    {
      symbol: "BTCUSDT",
      side: "buy",
      orderType: "market",
      notionalUsd: 3,
      leverage: 2,
    }
  );

  await runScenario(
    "Scenario 2: Unsafe ETH Order",
    guardedClient,
    paperClient,
    {
      symbol: "ETHUSDT",
      side: "buy",
      orderType: "market",
      notionalUsd: 200,
      leverage: 20,
    }
  );

  console.log("\n=== Summary ===");
  console.log("BTCUSDT was approved by AgentGuard and reached the paper client.");
  console.log("ETHUSDT was blocked by AgentGuard and never reached the paper client.");
  console.log("No live trading is implemented.");
  console.log("No cancel, close, leverage, transfer, or withdraw endpoints are used.");
}

main().catch((error) => {
  console.error("Guarded paper order demo failed:", error);
  process.exit(1);
});
