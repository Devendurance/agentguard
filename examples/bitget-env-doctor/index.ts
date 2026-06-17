/**
 * Bitget Environment Doctor Demo
 * 
 * Helps diagnose why Codex/Node cannot see environment variables.
 * Safety: Prints boolean presence only, never actual values.
 */

function boolStatus(value: boolean): string {
  return value ? "yes" : "no";
}

function main() {
  console.log("=== Bitget Environment Doctor ===\n");
  
  // Print current working directory
  console.log(`Current working directory: ${process.cwd()}\n`);
  
  // Print Node version
  console.log(`Node version: ${process.version}\n`);
  
  // Print boolean presence only for environment variables
  console.log("Environment variable presence (values never shown):");
  console.log(`  BITGET_API_KEY:                      ${boolStatus(!!process.env.BITGET_API_KEY)}`);
  console.log(`  BITGET_SECRET_KEY:                   ${boolStatus(!!process.env.BITGET_SECRET_KEY)}`);
  console.log(`  BITGET_API_SECRET:                   ${boolStatus(!!process.env.BITGET_API_SECRET)}`);
  console.log(`  BITGET_PASSPHRASE:                   ${boolStatus(!!process.env.BITGET_PASSPHRASE)}`);
  console.log(`  BITGET_MODE:                         ${boolStatus(!!process.env.BITGET_MODE)}`);
  console.log(`  BITGET_PAPER_TRADING:                ${boolStatus(!!process.env.BITGET_PAPER_TRADING)}`);
  console.log(`  AGENTGUARD_ALLOW_PAPER_TRADING:      ${boolStatus(!!process.env.AGENTGUARD_ALLOW_PAPER_TRADING)}`);
  console.log(`  AGENTGUARD_ALLOW_LIVE_TRADING:       ${boolStatus(!!process.env.AGENTGUARD_ALLOW_LIVE_TRADING)}`);
  console.log();
  
  // Print safe guidance
  console.log("Guidance:");
  console.log("  If values show 'no' but you set them in Windows, restart Codex/terminal or set them in the current PowerShell session.");
  console.log();
  
  // Summary
  console.log("=== Safety Notes ===");
  console.log("✓ No secret values were printed");
  console.log("✓ No HTTP requests were made");
  console.log("✓ No API calls were performed");
  console.log();
}

main();
