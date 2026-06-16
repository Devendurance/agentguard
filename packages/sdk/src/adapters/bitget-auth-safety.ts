/**
 * Bitget authentication safety preflight utility
 * 
 * Checks environment readiness for paper trading without exposing secrets.
 * Phase 5D: Safety preflight only - no authenticated calls, no order placement.
 */

export interface BitgetAuthEnvStatus {
  /** Whether BITGET_API_KEY is present (boolean only, never value) */
  hasApiKey: boolean;
  /** Whether BITGET_SECRET_KEY is present (boolean only, never value) */
  hasSecretKey: boolean;
  /** Whether BITGET_PASSPHRASE is present (boolean only, never value) */
  hasPassphrase: boolean;
  /** Value of BITGET_MODE if set */
  bitgetMode?: string;
  /** Whether paper trading is explicitly enabled via any of the required flags */
  paperTradingExplicitlyEnabled: boolean;
  /** Whether live trading is explicitly enabled (always false in Phase 5D) */
  liveTradingExplicitlyEnabled: boolean;
  /** Whether all conditions for paper trading are met */
  canUsePaperTrading: boolean;
  /** Whether live trading is allowed (always false in Phase 5D) */
  canUseLiveTrading: boolean;
  /** List of missing required environment variable names */
  missing: string[];
  /** List of safety warnings to display to user */
  warnings: string[];
}

/**
 * Inspect Bitget authentication environment without exposing secret values
 * 
 * @param env - Environment variables to check (defaults to process.env)
 * @returns BitgetAuthEnvStatus with boolean flags and warnings only
 */
export function inspectBitgetAuthEnv(env: NodeJS.ProcessEnv = process.env): BitgetAuthEnvStatus {
  const hasApiKey = !!env.BITGET_API_KEY;
  const hasSecretKey = !!env.BITGET_SECRET_KEY;
  const hasPassphrase = !!env.BITGET_PASSPHRASE;
  const bitgetMode = env.BITGET_MODE;
  
  // Paper trading explicitly enabled if ANY of these flags is "true"
  const paperTradingExplicitlyEnabled = 
    bitgetMode === "paper" ||
    env.BITGET_PAPER_TRADING === "true" ||
    env.AGENTGUARD_ALLOW_PAPER_TRADING === "true";
  
  // Live trading explicitly enabled only via AGENTGUARD_ALLOW_LIVE_TRADING
  const liveTradingExplicitlyEnabled = env.AGENTGUARD_ALLOW_LIVE_TRADING === "true";
  
  // Collect missing credentials
  const missing: string[] = [];
  if (!hasApiKey) missing.push("BITGET_API_KEY");
  if (!hasSecretKey) missing.push("BITGET_SECRET_KEY");
  if (!hasPassphrase) missing.push("BITGET_PASSPHRASE");
  
  // Collect warnings
  const warnings: string[] = [];
  
  if (liveTradingExplicitlyEnabled) {
    warnings.push("Live trading is not implemented in this phase.");
  }
  
  if (paperTradingExplicitlyEnabled) {
    warnings.push("Paper trading requires Demo API keys from Bitget Demo mode.");
  }
  
  if (hasApiKey || hasSecretKey || hasPassphrase) {
    warnings.push("Do not use live API keys for paper trading.");
  }
  
  if ((hasApiKey && hasSecretKey && hasPassphrase) && !paperTradingExplicitlyEnabled) {
    warnings.push("Missing required paper trading safety flags.");
  }
  
  // canUsePaperTrading: all credentials present + paper flags enabled + live NOT enabled
  const canUsePaperTrading = 
    hasApiKey && hasSecretKey && hasPassphrase && 
    paperTradingExplicitlyEnabled && 
    !liveTradingExplicitlyEnabled;
  
  // canUseLiveTrading: always false in Phase 5D
  const canUseLiveTrading = false;
  
  return {
    hasApiKey,
    hasSecretKey,
    hasPassphrase,
    bitgetMode,
    paperTradingExplicitlyEnabled,
    liveTradingExplicitlyEnabled,
    canUsePaperTrading,
    canUseLiveTrading,
    missing,
    warnings,
  };
}

/**
 * Assert that paper trading can be used, throwing descriptive error if not
 * 
 * @param env - Environment variables to check (defaults to process.env)
 * @returns BitgetAuthEnvStatus if paper trading is allowed
 * @throws Error with missing vars and required flags if paper trading is not allowed
 */
export function assertCanUsePaperTrading(env: NodeJS.ProcessEnv = process.env): BitgetAuthEnvStatus {
  const status = inspectBitgetAuthEnv(env);
  
  if (!status.canUsePaperTrading) {
    const issues: string[] = [];
    
    if (status.missing.length > 0) {
      issues.push(`Missing required credentials: ${status.missing.join(", ")}`);
    }
    
    if (!status.paperTradingExplicitlyEnabled) {
      issues.push(
        "Paper trading safety flags not set. Set ONE of:\n" +
        "  BITGET_MODE=paper\n" +
        "  BITGET_PAPER_TRADING=true\n" +
        "  AGENTGUARD_ALLOW_PAPER_TRADING=true"
      );
    }
    
    if (status.liveTradingExplicitlyEnabled) {
      issues.push("Live trading flag is set but live trading is not implemented in this phase.");
    }
    
    throw new Error(
      "Paper trading preflight failed:\n\n" +
      issues.join("\n") +
      "\n\nReminder: Use Bitget Demo API keys (from Demo mode), not live trading keys.\n" +
      "See: docs/bitget-paper-trading-safety.md"
    );
  }
  
  return status;
}
