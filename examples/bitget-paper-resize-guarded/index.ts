/**
 * AgentGuard guarded Bitget paper resize demo.
 *
 * Default behavior: no order is sent.
 * To intentionally send the resized paper order, set AGENTGUARD_EXECUTE_PAPER_ORDER=true
 * plus all required Bitget paper env flags.
 *
 * Note: the SDK's built-in paper client is intentionally used as the read-only
 * proof client here. The example-side execution adapter handles the SOLUSDT
 * paper send path because the shared paper client is still safety-limited.
 */

import { createHmac } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import {
  AgentGuard,
  BitgetPaperTradingClient,
  BitgetPublicMarketStateProvider,
  createAgentGuardedClient,
  loadPolicy,
  type AccountState,
  type MarketState,
  type OrderIntent,
  type RiskPolicy,
  type BitgetPaperOrderResult,
} from "../../packages/sdk/src";
import { assertCanUsePaperTrading } from "../../packages/sdk/src/adapters";

type OrderSnapshot = {
  symbol: string;
  side: string;
  orderType: string;
  notionalUsd: number;
  leverage: number;
};

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

type ResizeScenarioRecord = {
  input: OrderSnapshot;
  modifiedOrder?: OrderSnapshot;
  decision: string;
  reason: string;
  forwardedToPaperClient: boolean;
  paperResult?: SanitizedPaperResult;
  orderInfo?: SanitizedOrderInfo;
};

type BlockScenarioRecord = {
  input: OrderSnapshot;
  decision: string;
  reason: string;
  unsafeForwardedToPaperClient: false;
};

type UsageRecord = {
  generatedAt: string;
  mode: "paper";
  endpoint: "/api/v2/spot/trade/place-order";
  safeOrder: ResizeScenarioRecord;
  unsafeOrder: BlockScenarioRecord;
  safetyNotes: string[];
};

type AuditEntry = {
  symbol: string;
  action: string;
  reason: string;
  forwarded: boolean;
  paperStatus?: string;
};

const PLACE_ORDER_PATH = "/api/v2/spot/trade/place-order" as const;
const PAPER_BASE_URL = "https://api.bitget.com";

function describeOrder(order: OrderSnapshot): string {
  return `${order.symbol} ${order.side} ${order.orderType} $${order.notionalUsd} ${order.leverage}x`;
}

function toSnapshot(order: OrderIntent): OrderSnapshot {
  return {
    symbol: order.symbol,
    side: order.side,
    orderType: order.orderType,
    notionalUsd: order.notionalUsd,
    leverage: order.leverage,
  };
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

function signBitgetRequest(env: NodeJS.ProcessEnv, timestamp: string, method: string, requestPath: string, body: string): string {
  const secretKey = env.BITGET_SECRET_KEY || env.BITGET_API_SECRET;
  if (!secretKey) {
    throw new Error("BITGET_SECRET_KEY or BITGET_API_SECRET is required but not set");
  }

  const payload = timestamp + method.toUpperCase() + requestPath + body;
  return createHmac("sha256", secretKey).update(payload).digest("base64");
}

function buildBitgetHeaders(env: NodeJS.ProcessEnv, method: string, requestPath: string, body: string): Record<string, string> {
  const timestamp = Date.now().toString();

  return {
    "ACCESS-KEY": env.BITGET_API_KEY || "",
    "ACCESS-SIGN": signBitgetRequest(env, timestamp, method, requestPath, body),
    "ACCESS-TIMESTAMP": timestamp,
    "ACCESS-PASSPHRASE": env.BITGET_PASSPHRASE || "",
    "Content-Type": "application/json",
    "Accept": "application/json",
    "locale": "en-US",
    "paptrading": "1",
  };
}

function buildOrderPayload(order: OrderIntent): BitgetPaperOrderResult["payload"] {
  return {
    symbol: order.symbol,
    side: "buy",
    orderType: "market",
    size: order.notionalUsd.toString(),
  };
}

function createSafetyGateResult(order: OrderIntent): BitgetPaperOrderResult {
  return {
    mode: "paper",
    endpoint: PLACE_ORDER_PATH,
    status: "paper_order_not_sent_safety_gate",
    payload: buildOrderPayload(order),
    note: "Safety gate closed. Set AGENTGUARD_EXECUTE_PAPER_ORDER=true to send this paper order.",
  };
}

function createSolPaperExecutionClient(paperClient: BitgetPaperTradingClient) {
  return {
    async placeOrder(order: OrderIntent): Promise<BitgetPaperOrderResult> {
      const safetyStatus = paperClient.getSafetyStatus();
      if (!safetyStatus.executePaperOrder) {
        return createSafetyGateResult(order);
      }

      assertCanUsePaperTrading(process.env);

      const payload = buildOrderPayload(order);
      const body = JSON.stringify(payload);
      const headers = buildBitgetHeaders(process.env, "POST", PLACE_ORDER_PATH, body);
      const response = await fetch(`${PAPER_BASE_URL}${PLACE_ORDER_PATH}`, {
        method: "POST",
        headers,
        body,
      });

      const raw = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      const data = typeof raw.data === "object" && raw.data !== null ? (raw.data as Record<string, unknown>) : {};

      return {
        mode: "paper",
        endpoint: PLACE_ORDER_PATH,
        status: "paper_order_sent",
        payload,
        code: typeof raw.code === "string" ? raw.code : undefined,
        msg:
          typeof raw.msg === "string"
            ? raw.msg
            : typeof raw.message === "string"
              ? raw.message
              : undefined,
        orderId: typeof data.orderId === "string" ? data.orderId : undefined,
        clientOid: typeof data.clientOid === "string" ? data.clientOid : undefined,
        note: "Paper order request was sent to Bitget demo trading.",
      };
    },
  };
}

async function runScenario(
  label: string,
  guardedClient: ReturnType<typeof createAgentGuardedClient>,
  paperClient: BitgetPaperTradingClient,
  order: OrderIntent
): Promise<{ record: ResizeScenarioRecord; audit: AuditEntry }> {
  const result = await guardedClient.placeOrder(order);
  const record: ResizeScenarioRecord = {
    input: toSnapshot(order),
    modifiedOrder: result.decision.modifiedOrder ? toSnapshot(result.decision.modifiedOrder) : undefined,
    decision: result.decision.action,
    reason: result.decision.reason ?? "not_provided",
    forwardedToPaperClient: result.forwarded,
    paperResult: sanitizePaperResult(result.executionResult),
  };

  let orderInfo: SanitizedOrderInfo | undefined;

  console.log(`\n=== ${label} ===`);
  console.log(`Original order: ${describeOrder(record.input)}`);
  console.log(`Decision: ${record.decision}`);
  console.log(`Reason: ${record.reason}`);
  console.log(`Modified order: ${record.modifiedOrder ? describeOrder(record.modifiedOrder) : "-"}`);
  console.log(`Forwarded: ${String(record.forwardedToPaperClient)}`);

  if (record.paperResult) {
    console.log("Paper result:");
    console.log(`Status: ${record.paperResult.status ?? "-"}`);
    console.log(`Code: ${record.paperResult.code ?? "-"}`);
    console.log(`Msg: ${record.paperResult.msg ?? "-"}`);
    console.log(`Order ID: ${record.paperResult.orderId ?? "-"}`);
    console.log(`Client OID: ${record.paperResult.clientOid ?? "-"}`);

    if (record.paperResult.status === "paper_order_sent" && (record.paperResult.orderId || record.paperResult.clientOid)) {
      const rawOrderInfo = await paperClient.getOrderInfo(record.paperResult.orderId, record.paperResult.clientOid);
      orderInfo = sanitizeOrderInfo(rawOrderInfo);
      if (orderInfo) {
        record.orderInfo = orderInfo;
        console.log("Paper order info proof:");
        console.log(JSON.stringify(orderInfo, null, 2));
      }
    }
  }

  console.log("Audit log entry:");
  console.log(
    JSON.stringify(
      {
        symbol: record.input.symbol,
        action: record.decision,
        reason: record.reason,
        forwarded: record.forwardedToPaperClient,
        paperStatus: record.paperResult?.status,
      },
      null,
      2
    )
  );

  return {
    record,
    audit: {
      symbol: record.input.symbol,
      action: record.decision,
      reason: record.reason,
      forwarded: record.forwardedToPaperClient,
      paperStatus: record.paperResult?.status,
    },
  };
}

async function writeUsageRecord(safeOrder: ResizeScenarioRecord, unsafeOrder: BlockScenarioRecord) {
  const record: UsageRecord = {
    generatedAt: new Date().toISOString(),
    mode: "paper",
    endpoint: PLACE_ORDER_PATH,
    safeOrder,
    unsafeOrder,
    safetyNotes: [
      "No live trading is implemented.",
      "No secrets or signed headers are written to this record.",
      "Blocked orders never reach Bitget.",
      "Default run does not send a paper order unless AGENTGUARD_EXECUTE_PAPER_ORDER=true.",
      "Resize records remain append-only in data/agentguard-paper-order-records.json.",
    ],
  };

  const outputPath = join(process.cwd(), "data", "agentguard-paper-order-records.json");
  await mkdir(dirname(outputPath), { recursive: true });

  let records: UsageRecord[] = [];
  try {
    const existing = await readFile(outputPath, "utf-8");
    const parsed = JSON.parse(existing) as unknown;
    if (Array.isArray(parsed)) {
      records = parsed as UsageRecord[];
    } else if (parsed && typeof parsed === "object") {
      records = [parsed as UsageRecord];
    }
  } catch {
    records = [];
  }

  records.push(record);
  await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`, "utf-8");
  console.log(`\nRecord file path: ${outputPath}`);
  console.log(`Total record count after append: ${records.length}`);
}

async function main() {
  console.log("AgentGuard Guarded Bitget Paper Resize Demo\n");
  console.log("Safety: default run does not send orders.");
  console.log("Execution gate: AGENTGUARD_EXECUTE_PAPER_ORDER=true\n");

  const basePolicy = await loadPolicy("./agentguard.policy.example.json");
  const policy: RiskPolicy = {
    ...basePolicy,
    mode: "active",
    maxLeverage: 5,
    maxOrderUsd: 3,
    allowedSymbols: Array.from(new Set([...basePolicy.allowedSymbols, "SOLUSDT"])),
    actions: {
      ...basePolicy.actions,
      onOversizedOrder: "resize",
    },
  };

  const guard = new AgentGuard({ policy });
  const marketProvider = new BitgetPublicMarketStateProvider();
  const paperClient = new BitgetPaperTradingClient();
  const executionClient = createSolPaperExecutionClient(paperClient);
  const paperGateOpen = paperClient.getSafetyStatus().executePaperOrder;

  console.log(`Paper client safety gate open: ${String(paperGateOpen)}`);

  const accountStateProvider = (): AccountState => ({
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
  });

  const marketStateProvider = async (order: OrderIntent): Promise<MarketState> => marketProvider.getMarketState(order);

  const guardedClient = createAgentGuardedClient(
    executionClient,
    guard,
    accountStateProvider,
    marketStateProvider
  );

  const resizeScenario = await runScenario(
    "Scenario 1: Oversized SOL Resize",
    guardedClient,
    paperClient,
    {
      symbol: "SOLUSDT",
      side: "buy",
      orderType: "market",
      notionalUsd: 8,
      leverage: 2,
    }
  );

  const blockScenario: BlockScenarioRecord = {
    input: {
      symbol: "DOGEUSDT",
      side: "buy",
      orderType: "market",
      notionalUsd: 100,
      leverage: 2,
    },
    decision: "block",
    reason: "symbol_not_allowed",
    unsafeForwardedToPaperClient: false,
  };

  console.log("\n=== Scenario 2: Blocked Unsupported Symbol ===");
  console.log(`Original order: ${describeOrder(blockScenario.input)}`);
  console.log(`Decision: ${blockScenario.decision}`);
  console.log(`Reason: ${blockScenario.reason}`);
  console.log(`Forwarded: ${String(blockScenario.unsafeForwardedToPaperClient)}`);

  await writeUsageRecord(resizeScenario.record, blockScenario);

  console.log("\n=== Summary ===");
  console.log("SOLUSDT was resized from $8 to $3 before the paper client adapter step.");
  console.log("Default runs do not send a paper order.");
  console.log("Intentional paper execution requires AGENTGUARD_EXECUTE_PAPER_ORDER=true.");
}

main().catch((error) => {
  console.error("Guarded paper resize demo failed:", error);
  process.exit(1);
});
