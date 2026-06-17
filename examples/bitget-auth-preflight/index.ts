import {
  inspectBitgetAuthEnv,
  assertCanUsePaperTrading,
  BitgetAuthEnvStatus,
} from "../../packages/sdk/src";

/**
 * Format a boolean status for display
 */
function boolStatus(value: boolean): string {
  return value ? "yes" : "no";
}

/**
 * Print a safe environment status table (booleans only, no secret values)
 */
function printEnvStatus(env: NodeJS.ProcessEnv): void {
  console.log("=== Bitget Auth Environment Status ===\n");
  console.log("Credentials (presence only, values never shown):");
  console.log(`  BITGET_API_KEY:                ${boolStatus(!!env.BITGET_API_KEY)}`);
  console.log(`  BITGET_SECRET_KEY or BITGET_API_SECRET: ${boolStatus(!!env.BITGET_SECRET_KEY || !!env.BITGET_API_SECRET)}`);
  console.log(`  BITGET_PASSPHRASE:             ${boolStatus(!!env.BITGET_PASSPHRASE)}`);
  console.log(`  BITGET_MODE=paper:             ${boolStatus(env.BITGET_MODE === "paper")}`);
  console.log(`  BITGET_PAPER_TRADING=true:     ${boolStatus(env.BITGET_PAPER_TRADING === "true")}`);
  console.log(`  AGENTGUARD_ALLOW_PAPER_TRADING=true: ${boolStatus(env.AGENTGUARD_ALLOW_PAPER_TRADING === "true")}`);
  console.log(`  AGENTGUARD_ALLOW_LIVE_TRADING=true:  ${boolStatus(env.AGENTGUARD_ALLOW_LIVE_TRADING === "true")}`);
  console.log();
}

/**
 * Run the Bitget auth preflight demo
 */
async function main() {
  console.log("AgentGuard Bitget Auth Preflight Demo\n");
  console.log("This demo checks environment readiness for paper trading.\n");
  console.log("Safety: No secret values are printed. No HTTP requests are made.\n");

  // Print environment status (booleans only)
  printEnvStatus(process.env);

  // Inspect environment (safe, no secrets printed)
  const status = inspectBitgetAuthEnv();

  // Try to assert paper trading capability
  console.log("=== Preflight Check ===");
  try {
    assertCanUsePaperTrading();
    console.log("✓ Paper trading preflight passed.");
    console.log("  Authenticated paper-mode calls may be enabled in a later phase.\n");
  } catch (error) {
    console.log("✗ Paper trading preflight failed.\n");
    console.log((error as Error).message);
    console.log("\n=== Next Steps ===");
    console.log("To enable paper trading preflight:");
    console.log("1. Create Demo API keys at https://www.bitget.com (Demo mode)");
    console.log("2. Set environment variables:");
    console.log("   export BITGET_API_KEY=<your-demo-key>");
    console.log("   export BITGET_SECRET_KEY=<your-demo-secret>");
    console.log("   export BITGET_PASSPHRASE=<your-demo-passphrase>");
    console.log("3. Enable paper trading safety flags (set ALL):");
    console.log("   Set ALL:");
    console.log("   BITGET_MODE=paper");
    console.log("   BITGET_PAPER_TRADING=true");
    console.log("   AGENTGUARD_ALLOW_PAPER_TRADING=true");
    console.log("\nReminder: Never use live trading API keys for paper demos.");
    console.log("See: docs/bitget-paper-trading-safety.md\n");
  }

  // Summary
  console.log("=== Demo Summary ===");
  console.log("✓ No HTTP requests were made");
  console.log("✓ No API key values were printed");
  console.log("✓ No private/order/account endpoints were called");
  console.log("✓ No trades were placed");
  console.log("✓ Safety preflight utility is ready for Phase 5E integration\n");
}

// Run demo with error handling
main().catch((error) => {
  console.error("Auth preflight demo failed:", error);
  process.exit(1);
});
