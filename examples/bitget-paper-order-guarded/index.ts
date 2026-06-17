/**
 * AgentGuard Guarded Bitget Paper Order Demo
 *
 * Default behavior: no order is sent.
 * To intentionally send the paper order, set AGENTGUARD_EXECUTE_PAPER_ORDER=true
 * plus all required Bitget paper env flags.
 */

import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import {
  AgentGuard,
  BitgetPaperTradingClient,
  createAgentGuardedClient,
  type AccountState,
  type MarketState,
  type OrderIntent,
  type RiskPolicy,
  type BitgetPaperOrderResult,
} from "../../packages/sdk/src";

type SanitizedPaperResult = {
  status?: string;
  code?: string;
  msg?: string;
  orderId?: string;
  clientOid?: string;
};

type SanitizedOrderInfo = {
  code?: string;
  msg?: string;
  orderId?: string;
  clientOid?: string;
  symbol?: string;
  side?: string;
  orderType?: string;
  status?: string;
};

type ScenarioRecord = {
  input: {
    symbol: string;
    side: string;
    orderType: string;
    notionalUsd: number;
    leverage: number;
  };
  decision: string;
  reason: string;
  forwardedToPaperClient?: boolean;
  unsafeForwardedToPaperClient?: boolean;
  paperResult?: SanitizedPaperResult;
  orderInfo?: SanitizedOrderInfo;
};

function describeOrder(order: OrderIntent): string {
  return `${order.symbol} ${order.side} ${order.orderType} $${order.notionalUsd} ${order.leverage}x`;
}

function sanitizePaperResult(result: unknown): SanitizedPaperResult | undefined {
  if (!result || typeof result !== "object") {
    return undefined;
  }

  const paperResult = result as Partial<BitgetPaperOrderResult>;
  return {
    status: paperResult.status,
    code: paperResult.code,
    msg: paperResult.msg,
    orderId: paperResult.orderId,
    clientOid: paperResult.clientOid,
  };
}

function sanitizeOrderInfo(result: unknown): SanitizedOrderInfo | undefined {
  if (!result || typeof result !== "object") {
    return undefined;
  }

  const orderInfo = result as SanitizedOrderInfo;
  return {
    code: orderInfo.code,
    msg: orderInfo.msg,
    orderId: orderInfo.orderId,
    clientOid: orderInfo.clientOid,
    symbol: orderInfo.symbol,
    side: orderInfo.side,
    orderType: orderInfo.orderType,
    status: orderInfo.status,
  };
}

async function runScenario(
  label: string,
  guardedClient: ReturnType<typeof createAgentGuardedClient>,
  paperClient: BitgetPaperTradingClient,
  order: OrderIntent
): Promise<ScenarioRecord> {
  const before = paperClient.getSafetyStatus().executePaperOrder;
  const result = await guardedClient.placeOrder(order);
  let orderInfo: SanitizedOrderInfo | undefined;

  console.log(`\n=== ${label} ===`);
  console.log(`Order: ${describeOrder(order)}`);
  console.log(`Decision: ${result.decision.action}`);
  console.log(`Reason: ${result.decision.reason}`);
  console.log(`Forwarded to paper client: ${result.forwarded}`);

  if (result.executionResult) {
    console.log("Paper client result:");
    console.log(JSON.stringify(result.executionResult, null, 2));

    const paperResult = result.executionResult as BitgetPaperOrderResult;
    if (
      paperResult.status === "paper_order_sent" &&
      (paperResult.orderId || paperResult.clientOid)
    ) {
      const rawOrderInfo = await paperClient.getOrderInfo(
        paperResult.orderId,
        paperResult.clientOid
      );
      console.log("Paper order info proof:");
      console.log(JSON.stringify(rawOrderInfo, null, 2));
      orderInfo = sanitizeOrderInfo(rawOrderInfo);
    }
  } else {
    console.log("Paper client was not called.");
  }

  if (!before) {
    console.log("Default safety gate: no paper order was sent.");
  }

  return {
    input: {
      symbol: order.symbol,
      side: order.side,
      orderType: order.orderType,
      notionalUsd: order.notionalUsd,
      leverage: order.leverage,
    },
    decision: result.decision.action,
    reason: result.decision.reason ?? "not_provided",
    forwardedToPaperClient: result.forwarded,
    paperResult: sanitizePaperResult(result.executionResult),
    orderInfo,
  };
}

async function writeUsageRecord(safeOrder: ScenarioRecord, unsafeOrder: ScenarioRecord) {
  const record = {
    generatedAt: new Date().toISOString(),
    mode: "paper",
    endpoint: "/api/v2/spot/trade/place-order",
    safeOrder,
    unsafeOrder: {
      input: unsafeOrder.input,
      decision: unsafeOrder.decision,
      reason: unsafeOrder.reason,
      unsafeForwardedToPaperClient: false,
    },
    safetyNotes: [
      "No live trading is implemented.",
      "No secrets or signed headers are written to this record.",
      "No cancel, close, leverage, transfer, or withdraw endpoints are used.",
      "Default run does not send a paper order unless AGENTGUARD_EXECUTE_PAPER_ORDER=true.",
    ],
  };

  const outputPath = join(process.cwd(), "data", "agentguard-paper-order-record.json");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(record, null, 2)}\n`, "utf-8");
  console.log("\nUsage record written: data/agentguard-paper-order-record.json");
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

  const safeOrderRecord = await runScenario(
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

  const unsafeOrderRecord = await runScenario(
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

  await writeUsageRecord(safeOrderRecord, unsafeOrderRecord);

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
