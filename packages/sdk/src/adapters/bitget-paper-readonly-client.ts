/**
 * Bitget Paper Trading Read-Only Client
 * 
 * Phase 5E: Authenticated paper-mode read-only account probe.
 * Safety: No order placement, no mutating endpoints, no secret printing.
 */

import { createHmac } from "crypto";
import { assertCanUsePaperTrading } from "./bitget-auth-safety";

export interface BitgetPaperReadOnlyClientOptions {
  baseUrl?: string;
  env?: NodeJS.ProcessEnv;
  debugSafe?: boolean;
}

export interface BitgetPaperAccountAsset {
  coin: string;
  available?: string;
  frozen?: string;
  locked?: string;
  limitAvailable?: string;
  uTime?: string;
}

export interface BitgetPaperAccountProbeResult {
  mode: "paper";
  endpoint: string;
  paptradingHeader: "1";
  requestTime?: number;
  code?: string;
  message?: string;
  assetCount: number;
  assets: BitgetPaperAccountAsset[];
  note: string;
}

export interface BitgetPaperReadOnlyErrorDetails {
  stage: "preflight" | "network" | "http" | "parse" | "unknown";
  endpoint?: string;
  method?: string;
  status?: number;
  statusText?: string;
  code?: string;
  message?: string;
  causeName?: string;
  causeMessage?: string;
  safeResponsePreview?: string;
}

const MUTATING_PATH_PATTERNS = [
  "/order",
  "/trade",
  "/transfer",
  "/withdraw",
  "/leverage",
  "/close",
];

export class BitgetPaperReadOnlyClient {
  private readonly baseUrl: string;
  private readonly env: NodeJS.ProcessEnv;
  private readonly debugSafe: boolean;

  constructor(options?: BitgetPaperReadOnlyClientOptions) {
    this.baseUrl = options?.baseUrl ?? "https://api.bitget.com";
    this.env = options?.env ?? process.env;
    this.debugSafe = options?.debugSafe ?? false;
    
    // Assert paper trading is properly configured before allowing any requests
    assertCanUsePaperTrading(this.env);
  }

  private getSecretKey(): string {
    // Prefer BITGET_SECRET_KEY as canonical, accept BITGET_API_SECRET as alias
    const secretKey = this.env.BITGET_SECRET_KEY || this.env.BITGET_API_SECRET;
    if (!secretKey) {
      throw new Error("BITGET_SECRET_KEY or BITGET_API_SECRET is required but not set");
    }
    return secretKey;
  }

  private sign(
    timestamp: string,
    method: string,
    requestPath: string,
    queryString: string,
    body: string
  ): string {
    // Bitget signature payload format
    const payload = timestamp + method.toUpperCase() + requestPath + (queryString ? "?" + queryString : "") + body;
    const secretKey = this.getSecretKey();
    const hmac = createHmac("sha256", secretKey);
    hmac.update(payload);
    return hmac.digest("base64");
  }

  private buildHeaders(
    method: string,
    requestPath: string,
    queryString: string,
    body: string
  ): Record<string, string> {
    const timestamp = Date.now().toString();
    const signature = this.sign(timestamp, method, requestPath, queryString, body);
    const passphrase = this.env.BITGET_PASSPHRASE || "";
    const apiKey = this.env.BITGET_API_KEY || "";

    return {
      "ACCESS-KEY": apiKey,
      "ACCESS-SIGN": signature,
      "ACCESS-TIMESTAMP": timestamp,
      "ACCESS-PASSPHRASE": passphrase,
      "Content-Type": "application/json",
      "locale": "en-US",
      "paptrading": "1", // Required for demo/paper trading endpoints
    };
  }

  private validateReadOnlyPath(requestPath: string): void {
    const lowerPath = requestPath.toLowerCase();
    for (const pattern of MUTATING_PATH_PATTERNS) {
      if (lowerPath.includes(pattern)) {
        throw new Error(
          `Blocked mutating endpoint detected: ${requestPath}. ` +
          "BitgetPaperReadOnlyClient only supports read-only account queries."
        );
      }
    }
  }

  private createSafeError(details: BitgetPaperReadOnlyErrorDetails): Error {
    // Stringify safe fields only - never include secrets, headers, or signatures
    const safeParts: string[] = [];
    
    if (details.stage) safeParts.push(`stage: ${details.stage}`);
    if (details.endpoint) safeParts.push(`endpoint: ${details.endpoint}`);
    if (details.method) safeParts.push(`method: ${details.method}`);
    if (details.status) safeParts.push(`status: ${details.status}`);
    if (details.statusText) safeParts.push(`statusText: ${details.statusText}`);
    if (details.code) safeParts.push(`code: ${details.code}`);
    if (details.message) safeParts.push(`message: ${details.message}`);
    if (details.causeName) safeParts.push(`causeName: ${details.causeName}`);
    if (details.causeMessage) safeParts.push(`causeMessage: ${details.causeMessage}`);
    if (details.safeResponsePreview) {
      const preview = details.safeResponsePreview.length > 500 
        ? details.safeResponsePreview.slice(0, 500) + "..." 
        : details.safeResponsePreview;
      safeParts.push(`responsePreview: ${preview}`);
    }
    
    return new Error(`BitgetPaperReadOnlyError: { ${safeParts.join(", ")} }`);
  }

  private logSafeDebug(requestPath: string, method: string, headers: Record<string, string>): void {
    if (!this.debugSafe) return;
    
    console.log("[debugSafe] Request metadata (values never shown):");
    console.log(`  baseUrl: ${this.baseUrl}`);
    console.log(`  endpoint: ${requestPath}`);
    console.log(`  method: ${method}`);
    console.log(`  paptrading header present: ${!!headers["paptrading"]}`);
    console.log(`  has access key header: ${!!headers["ACCESS-KEY"]}`);
    console.log(`  has signature header: ${!!headers["ACCESS-SIGN"]}`);
    console.log(`  timestamp length: ${headers["ACCESS-TIMESTAMP"]?.length ?? 0}`);
  }

  async getSpotAccountAssets(coin?: string): Promise<BitgetPaperAccountProbeResult> {
    const requestPath = "/api/v2/spot/account/assets";
    const method = "GET";
    
    // Safety: reject any mutating endpoint paths
    this.validateReadOnlyPath(requestPath);
    
    const queryString = coin ? `coin=${encodeURIComponent(coin)}` : "";
    const body = ""; // GET request has no body
    const headers = this.buildHeaders(method, requestPath, queryString, body);
    
    // Log safe debug info if enabled
    this.logSafeDebug(requestPath, method, headers);
    
    const url = queryString 
      ? `${this.baseUrl}${requestPath}?${queryString}` 
      : `${this.baseUrl}${requestPath}`;
    
    // Wrap fetch with safe error handling
    let response: Response;
    try {
      response = await fetch(url, { method, headers });
    } catch (error) {
      const err = error as Error;
      throw this.createSafeError({
        stage: "network",
        endpoint: requestPath,
        method: "GET",
        causeName: err.name,
        causeMessage: err.message,
      });
    }
    
    // Handle HTTP error responses
    if (!response.ok) {
      let responseText = "";
      let bitgetCode: string | undefined;
      let bitgetMessage: string | undefined;
      
      try {
        responseText = await response.text();
        // Try to parse as JSON for Bitget error format
        const parsed = JSON.parse(responseText) as Record<string, unknown>;
        bitgetCode = typeof parsed.code === "string" ? parsed.code : undefined;
        bitgetMessage = typeof parsed.message === "string" ? parsed.message : (typeof parsed.msg === "string" ? parsed.msg : undefined);
      } catch {
        // Non-JSON response, truncate for safe preview
        responseText = responseText.length > 500 ? responseText.slice(0, 500) + "..." : responseText;
      }
      
      throw this.createSafeError({
        stage: "http",
        endpoint: requestPath,
        method: "GET",
        status: response.status,
        statusText: response.statusText,
        code: bitgetCode,
        message: bitgetMessage,
        safeResponsePreview: responseText,
      });
    }
    
    // Parse JSON response - cast to unknown first, then to Record
    let parsedData: Record<string, unknown>;
    try {
      const raw = await response.json() as unknown;
      if (typeof raw === "object" && raw !== null) {
        parsedData = raw as Record<string, unknown>;
      } else {
        parsedData = {};
      }
    } catch (error) {
      throw this.createSafeError({
        stage: "parse",
        endpoint: requestPath,
        method: "GET",
        causeName: (error as Error).name,
        causeMessage: (error as Error).message,
      });
    }
    
    // Extract typed fields safely
    const dataCode = typeof parsedData.code === "string" ? parsedData.code : undefined;
    const dataMessage = typeof parsedData.message === "string" ? parsedData.message : undefined;
    const dataData = Array.isArray(parsedData.data) ? parsedData.data : undefined;
    
    // Check Bitget response code for application-level errors
    if (dataCode && dataCode !== "00000") {
      // Bitget uses "00000" for success
      throw this.createSafeError({
        stage: "http",
        endpoint: requestPath,
        method: "GET",
        status: response.status,
        code: dataCode,
        message: dataMessage,
      });
    }
    
    const responseTime = Date.now();
    
    // Normalize response data
    const assets: BitgetPaperAccountAsset[] = dataData 
      ? dataData.map((item: unknown) => {
          const it = item as Record<string, unknown>;
          return {
            coin: typeof it.coin === "string" ? it.coin : "",
            available: typeof it.available === "string" ? it.available : undefined,
            frozen: typeof it.frozen === "string" ? it.frozen : undefined,
            locked: typeof it.locked === "string" ? it.locked : undefined,
            limitAvailable: typeof it.limitAvailable === "string" ? it.limitAvailable : undefined,
            uTime: typeof it.uTime === "string" ? it.uTime : undefined,
          };
        })
      : [];
    
    return {
      mode: "paper",
      endpoint: requestPath,
      paptradingHeader: "1",
      requestTime: responseTime,
      code: dataCode,
      message: dataMessage,
      assetCount: assets.length,
      assets,
      note: "Authenticated paper-mode read-only account probe. No orders were placed.",
    };
  }
}
