/**
 * Bitget Paper Connectivity Diagnostic Demo
 * 
 * Run safe read-only diagnostics before authenticated paper account probe.
 * Tests public endpoint connectivity and env visibility only.
 * Safety: No authenticated calls, no secrets printed.
 */

import { inspectBitgetAuthEnv } from "../../packages/sdk/src";

function boolStatus(value: boolean): string {
  return value ? "yes" : "no";
}

function printSafeEnvSummary(env: NodeJS.ProcessEnv): void {
  console.log("=== Environment Visibility (values never shown) ===\n");
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

async function testPublicConnectivity(): Promise<void> {
  console.log("=== Public Endpoint Connectivity Test ===");
  console.log("GET https://api.bitget.com/api/v2/spot/market/tickers?symbol=BTCUSDT\n");
  
  try {
    const response = await fetch("https://api.bitget.com/api/v2/spot/market/tickers?symbol=BTCUSDT");
    
    console.log(`Status code: ${response.status}`);
    console.log(`OK: ${response.ok}`);
    
    if (response.ok) {
      // Try to parse and show safe summary only
      try {
        const data = await response.json() as { code?: string; message?: string; data?: any[] };
        console.log(`Bitget code: ${data.code ?? "N/A"}`);
        console.log(`Bitget message: ${data.message ?? "N/A"}`);
        if (Array.isArray(data.data)) {
          console.log(`Data items count: ${data.data.length}`);
          if (data.data.length > 0) {
            console.log(`First item symbol: ${(data.data[0] as any).symbol ?? "N/A"}`);
          }
        }
      } catch {
        console.log("Response body: <non-JSON or parse error>");
      }
    } else {
      console.log(`Status text: ${response.statusText}`);
      const text = await response.text();
      const preview = text.length > 200 ? text.slice(0, 200) + "..." : text;
      console.log(`Response preview: ${preview}`);
    }
    
    console.log("\n✓ Node fetch works against Bitget public endpoint\n");
    
  } catch (error) {
    const err = error as Error;
    console.log(`✗ Fetch failed: ${err.name}: ${err.message}\n`);
    console.log("Likely causes:");
    console.log("  • No internet connection");
    console.log("  • DNS resolution failure");
    console.log("  • Firewall/proxy blocking api.bitget.com");
    console.log("  • Bitget API temporarily unavailable");
    console.log("  • System clock skew affecting TLS\n");
  }
}

async function main() {
  console.log("=== AgentGuard Bitget Paper Connectivity Diagnostic ===\n");
  console.log("Purpose: Test public endpoint connectivity and env visibility.\n");
  console.log("Safety: No authenticated calls. No secrets printed.\n");

  // Test public connectivity first
  await testPublicConnectivity();

  // Run auth preflight check (env visibility only)
  console.log("=== Auth Preflight Check ===");
  const status = inspectBitgetAuthEnv();
  printSafeEnvSummary(process.env);
  
  console.log("Preflight result:");
  console.log(`  canUsePaperTrading: ${boolStatus(status.canUsePaperTrading)}`);
  console.log(`  canUseLiveTrading: ${boolStatus(status.canUseLiveTrading)}`);
  
  if (status.warnings.length > 0) {
    console.log("\nWarnings:");
    status.warnings.forEach((w) => console.log(`  • ${w}`));
  }
  
  if (status.missing.length > 0) {
    console.log(`\nMissing: ${status.missing.join(", ")}`);
  }
  console.log();

  // Summary
  console.log("=== Diagnostic Summary ===");
  console.log("✓ Public endpoint test completed (safe, no auth)");
  console.log("✓ Environment visibility check completed (booleans only)");
  console.log("✓ No API key values were printed");
  console.log("✓ No authenticated endpoints were called");
  console.log("✓ No trades were placed");
  console.log("\nNext: Run 'npm run demo:bitget-paper-account-probe' for authenticated probe.\n");
}

main().catch((error) => {
  console.error("Connectivity diagnostic failed:", error);
  process.exit(1);
});
