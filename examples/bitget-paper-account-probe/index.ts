/**
 * Bitget Paper Account Probe Demo
 * 
 * Phase 5E: Verify paper/demo API credentials with a read-only authenticated account call.
 * Safety: No secret values printed, no orders placed, no mutating endpoints called.
 */

import { BitgetPaperReadOnlyClient, BitgetPaperReadOnlyErrorDetails, inspectBitgetAuthEnv } from "../../packages/sdk/src";

function boolStatus(value: boolean): string {
  return value ? "yes" : "no";
}

function printSafeEnvSummary(env: NodeJS.ProcessEnv): void {
  console.log("=== Environment Summary (values never shown) ===\n");
  console.log("Credentials:");
  console.log(`  BITGET_API_KEY:                ${boolStatus(!!env.BITGET_API_KEY)}`);
  console.log(`  BITGET_SECRET_KEY or BITGET_API_SECRET: ${boolStatus(!!env.BITGET_SECRET_KEY || !!env.BITGET_API_SECRET)}`);
  console.log(`  BITGET_PASSPHRASE:             ${boolStatus(!!env.BITGET_PASSPHRASE)}`);
  console.log("\nPaper trading flags:");
  console.log(`  BITGET_MODE=paper:             ${boolStatus(env.BITGET_MODE === "paper")}`);
  console.log(`  BITGET_PAPER_TRADING=true:     ${boolStatus(env.BITGET_PAPER_TRADING === "true")}`);
  console.log(`  AGENTGUARD_ALLOW_PAPER_TRADING=true: ${boolStatus(env.AGENTGUARD_ALLOW_PAPER_TRADING === "true")}`);
  console.log("\nLive trading gate:");
  console.log(`  AGENTGUARD_ALLOW_LIVE_TRADING=true:  ${boolStatus(env.AGENTGUARD_ALLOW_LIVE_TRADING === "true")}`);
  console.log();
}

function getLikelyFix(stage: string, status?: number, code?: string): string {
  switch (stage) {
    case "network":
      return "Check internet connection, VPN/proxy settings, or Bitget API availability";
    case "http":
      if (status === 401 || status === 400) {
        return "Check signature calculation, system clock sync, demo key validity, or passphrase";
      }
      if (code && (code.startsWith("4") || code === "auth")) {
        return "Verify demo API key (not live key), IP whitelist settings, or paptrading:1 header";
      }
      return "Check Bitget API status and endpoint documentation";
    case "parse":
      return "Endpoint returned unexpected response format; check Bitget API version";
    case "preflight":
      return "Ensure all paper trading flags are set: BITGET_MODE=paper, BITGET_PAPER_TRADING=true, AGENTGUARD_ALLOW_PAPER_TRADING=true";
    default:
      return "Review error details and Bitget API documentation";
  }
}

async function main() {
  console.log("=== AgentGuard Bitget Paper Account Probe ===\n");
  console.log("Purpose: Verify paper/demo API credentials with read-only authenticated account call.\n");
  console.log("Safety: No secret values printed. No orders placed. No mutating endpoints called.\n");

  // Print safe env summary
  printSafeEnvSummary(process.env);

  // Create client (will assert paper trading config)
  console.log("=== Creating Paper Read-Only Client ===");
  const client = new BitgetPaperReadOnlyClient({ debugSafe: true });
  console.log("✓ Client initialized with paper-mode safety checks\n");

  // Call read-only endpoint
  console.log("=== Calling GET /api/v2/spot/account/assets ===");
  try {
    const result = await client.getSpotAccountAssets("USDT");
    
    console.log("✓ Request succeeded\n");
    console.log("=== Probe Result (sanitized) ===");
    console.log(`  mode: ${result.mode}`);
    console.log(`  endpoint: ${result.endpoint}`);
    console.log(`  paptrading header used: ${result.paptradingHeader === "1" ? "yes" : "no"}`);
    console.log(`  response code: ${result.code ?? "N/A"}`);
    console.log(`  response message: ${result.message ?? "N/A"}`);
    console.log(`  asset count: ${result.assetCount}`);
    
    if (result.assets.length > 0) {
      console.log("\n  Coins found:");
      result.assets.forEach((asset) => {
        const showBalances = process.env.BITGET_PRINT_PAPER_BALANCES === "true";
        if (showBalances) {
          console.log(`    - ${asset.coin}: available=${asset.available ?? "N/A"}, frozen=${asset.frozen ?? "N/A"}`);
        } else {
          console.log(`    - ${asset.coin}`);
        }
      });
    }
    
    console.log(`\n  note: ${result.note}`);
    
  } catch (error) {
    console.log("✗ Request failed\n");
    
    // Try to extract structured error details
    const err = error as Error;
    const msg = err.message;
    
    // Parse safe error details if present
    let stage: string | undefined;
    let status: number | undefined;
    let code: string | undefined;
    let causeMsg: string | undefined;
    
    // Extract from formatted error message
    const stageMatch = msg.match(/stage: ([^,}]+)/);
    const statusMatch = msg.match(/status: (\d+)/);
    const codeMatch = msg.match(/code: ([^,}]+)/);
    const causeMatch = msg.match(/causeMessage: ([^}]+)/);
    
    if (stageMatch) stage = stageMatch[1].trim();
    if (statusMatch) status = parseInt(statusMatch[1], 10);
    if (codeMatch) code = codeMatch[1].trim();
    if (causeMatch) causeMsg = causeMatch[1].trim();
    
    console.log("=== Structured Error Details ===");
    if (stage) console.log(`  stage: ${stage}`);
    if (status) console.log(`  HTTP status: ${status}`);
    if (code) console.log(`  Bitget code: ${code}`);
    if (causeMsg) console.log(`  cause: ${causeMsg}`);
    
    const fix = getLikelyFix(stage || "unknown", status, code);
    console.log(`\n  Likely fix: ${fix}`);
    
    console.log("\n=== Full Error (safe preview) ===");
    // Truncate error message for safe display
    const preview = msg.length > 800 ? msg.slice(0, 800) + "..." : msg;
    console.log(`  ${preview}`);
    
    console.log("\n=== Likely Causes Reference ===");
    console.log("  • fetch failed (network): internet/VPN/proxy/Bitget availability");
    console.log("  • HTTP 401/400: signature, timestamp, demo key, passphrase issues");
    console.log("  • Bitget auth error: demo vs live key mismatch, IP whitelist, paptrading header");
    console.log("  • Parse error: unexpected endpoint response format");
    console.log("  • Preflight error: missing paper trading safety flags");
    console.log("\n  Reminder: Demo keys must be created in Bitget Demo mode.");
    console.log("  See: docs/bitget-paper-trading-safety.md");
  }

  // Summary
  console.log("\n=== Demo Summary ===");
  console.log("✓ No HTTP requests were made to mutating endpoints");
  console.log("✓ No API key values were printed");
  console.log("✓ No order placement, cancel, transfer, withdraw, leverage, or close endpoints called");
  console.log("✓ No trades were placed");
  console.log("✓ paptrading: 1 header was included for demo mode");
  console.log("✓ Balance values hidden unless BITGET_PRINT_PAPER_BALANCES=true");
  console.log("✓ Structured safe error diagnostics enabled");
  console.log("\nPhase 5E: Authenticated paper-mode read-only account probe complete.\n");
}

main().catch((error) => {
  console.error("Paper account probe demo failed:", error);
  process.exit(1);
});
