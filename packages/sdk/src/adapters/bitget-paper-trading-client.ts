/**
 * Bitget Paper Trading Client
 *
 * Minimal Phase 5F guarded paper-order adapter.
 * Safety: no order is sent unless AGENTGUARD_EXECUTE_PAPER_ORDER=true.
 */

import { createHmac } from "crypto";
import { ExecutionClient, OrderIntent } from "../types";
import { assertCanUsePaperTrading, inspectBitgetAuthEnv } from "./bitget-auth-safety";

export interface BitgetPaperTradingClientOptions {
  baseUrl?: string;
  env?: NodeJS.ProcessEnv;
}

export type BitgetPaperOrderStatus =
  | "paper_order_not_sent_safety_gate"
  | "paper_order_not_sent_live_flag"
  | "paper_order_not_sent_invalid_order"
  | "paper_order_sent";

export interface BitgetPaperOrderResult {
  mode: "paper";
  endpoint: "/api/v2/spot/trade/place-order";
  status: BitgetPaperOrderStatus;
  payload: {
    symbol: string;
    side: "buy";
    orderType: "market";
    size: string;
  };
  code?: string;
  msg?: string;
  orderId?: string;
  clientOid?: string;
  reason?: string;
  note: string;
}

export interface BitgetPaperOrderErrorResult extends BitgetPaperOrderResult {
  status: "paper_order_not_sent_invalid_order";
  reason: string;
}

const PLACE_ORDER_PATH = "/api/v2/spot/trade/place-order" as const;
const MAX_PAPER_ORDER_USD = 3;

/**
 * Minimal paper-mode execution client.
 *
 * It intentionally implements only placeOrder. It does not implement cancel,
 * close, leverage, transfer, or withdraw operations.
 */
export class BitgetPaperTradingClient implements ExecutionClient {
  private readonly baseUrl: string;
  private readonly env: NodeJS.ProcessEnv;

  constructor(options?: BitgetPaperTradingClientOptions) {
    this.baseUrl = options?.baseUrl ?? "https://api.bitget.com";
    this.env = options?.env ?? process.env;
  }

  async placeOrder(order: OrderIntent): Promise<BitgetPaperOrderResult> {
    const invalidReason = this.getInvalidOrderReason(order);
    const payload = this.toPayload(order);

    if (invalidReason) {
      return {
        mode: "paper",
        endpoint: PLACE_ORDER_PATH,
        status: "paper_order_not_sent_invalid_order",
        payload,
        reason: invalidReason,
        note: "Paper order was not sent because it failed AgentGuard paper-order adapter safety limits.",
      } satisfies BitgetPaperOrderErrorResult;
    }

    if (this.env.AGENTGUARD_ALLOW_LIVE_TRADING === "true") {
      return {
        mode: "paper",
        endpoint: PLACE_ORDER_PATH,
        status: "paper_order_not_sent_live_flag",
        payload,
        note: "Paper order was not sent because AGENTGUARD_ALLOW_LIVE_TRADING=true is incompatible with this demo.",
      };
    }

    if (this.env.AGENTGUARD_EXECUTE_PAPER_ORDER !== "true") {
      return {
        mode: "paper",
        endpoint: PLACE_ORDER_PATH,
        status: "paper_order_not_sent_safety_gate",
        payload,
        note: "Safety gate closed. Set AGENTGUARD_EXECUTE_PAPER_ORDER=true to send this paper order.",
      };
    }

    // Require all paper-mode credential and environment preflight checks only
    // after the explicit execution gate is opened.
    assertCanUsePaperTrading(this.env);

    const response = await this.postPaperOrder(payload);
    return {
      mode: "paper",
      endpoint: PLACE_ORDER_PATH,
      status: "paper_order_sent",
      payload,
      code: response.code,
      msg: response.msg,
      orderId: response.orderId,
      clientOid: response.clientOid,
      note: "Paper order request was sent to Bitget demo trading.",
    };
  }

  private getInvalidOrderReason(order: OrderIntent): string | null {
    if (order.symbol !== "BTCUSDT") {
      return "Only BTCUSDT is allowed for the guarded paper order demo.";
    }
    if (order.side !== "buy") {
      return "Only buy side is allowed for the guarded paper order demo.";
    }
    if (order.orderType !== "market") {
      return "Only market orders are allowed for the guarded paper order demo.";
    }
    if (order.notionalUsd > MAX_PAPER_ORDER_USD) {
      return `Paper order size must be <= ${MAX_PAPER_ORDER_USD} USD.`;
    }
    if (order.notionalUsd <= 0) {
      return "Paper order size must be positive.";
    }
    return null;
  }

  private toPayload(order: OrderIntent): BitgetPaperOrderResult["payload"] {
    return {
      symbol: order.symbol,
      side: "buy",
      orderType: "market",
      // For Bitget spot market buys, size is quote coin amount, e.g. USDT.
      size: order.notionalUsd.toString(),
    };
  }

  private getSecretKey(): string {
    const secretKey = this.env.BITGET_SECRET_KEY || this.env.BITGET_API_SECRET;
    if (!secretKey) {
      throw new Error("BITGET_SECRET_KEY or BITGET_API_SECRET is required but not set");
    }
    return secretKey;
  }

  private sign(timestamp: string, method: string, requestPath: string, body: string): string {
    const payload = timestamp + method.toUpperCase() + requestPath + body;
    const hmac = createHmac("sha256", this.getSecretKey());
    hmac.update(payload);
    return hmac.digest("base64");
  }

  private buildHeaders(method: string, requestPath: string, body: string): Record<string, string> {
    const timestamp = Date.now().toString();
    return {
      "ACCESS-KEY": this.env.BITGET_API_KEY || "",
      "ACCESS-SIGN": this.sign(timestamp, method, requestPath, body),
      "ACCESS-TIMESTAMP": timestamp,
      "ACCESS-PASSPHRASE": this.env.BITGET_PASSPHRASE || "",
      "Content-Type": "application/json",
      "Accept": "application/json",
      "locale": "en-US",
      "paptrading": "1",
    };
  }

  private async postPaperOrder(
    payload: BitgetPaperOrderResult["payload"]
  ): Promise<{ code?: string; msg?: string; orderId?: string; clientOid?: string }> {
    const method = "POST";
    const body = JSON.stringify(payload);
    const headers = this.buildHeaders(method, PLACE_ORDER_PATH, body);
    const response = await fetch(`${this.baseUrl}${PLACE_ORDER_PATH}`, {
      method,
      headers,
      body,
    });

    const raw = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const data = typeof raw.data === "object" && raw.data !== null
      ? (raw.data as Record<string, unknown>)
      : {};

    return {
      code: typeof raw.code === "string" ? raw.code : undefined,
      msg: typeof raw.msg === "string"
        ? raw.msg
        : typeof raw.message === "string"
          ? raw.message
          : undefined,
      orderId: typeof data.orderId === "string" ? data.orderId : undefined,
      clientOid: typeof data.clientOid === "string" ? data.clientOid : undefined,
    };
  }

  getSafetyStatus() {
    return {
      executePaperOrder: this.env.AGENTGUARD_EXECUTE_PAPER_ORDER === "true",
      auth: inspectBitgetAuthEnv(this.env),
    };
  }
}
