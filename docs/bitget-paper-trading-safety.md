# Bitget Paper Trading Safety

> **Phase 5D: Safety Preflight Only** — This phase does NOT place orders or make authenticated API calls.

## Overview

This document explains the safety preflight checks for Bitget paper trading integration with AgentGuard.

### What Phase 5D Does

✓ Checks whether required environment variables are present  
✓ Verifies paper trading safety flags are explicitly set  
✓ Reports missing credentials or misconfiguration  
✓ **Does NOT** print API key values or secrets  
✓ **Does NOT** make HTTP requests to Bitget APIs  
✓ **Does NOT** place orders or call authenticated endpoints  

### What Phase 5D Does NOT Do

✗ Place any trades (paper or live)  
✗ Call private/account/order endpoints  
✗ Use API keys for actual authentication  
✗ Send any requests to Bitget APIs  
✗ Enable live trading (not implemented in this phase)  

---

## Bitget Demo Trading Requirements

Bitget official documentation states that demo/paper trading REST calls require:

1. **Demo API Keys** — Created in Bitget Demo mode, separate from live trading keys
2. **Request Header** — `paptrading: 1` must be included in all demo API requests
3. **Demo Mode Endpoint** — Some endpoints may require demo-specific base URLs

> **Important**: Demo API keys only work in demo mode. Live API keys only work in live mode. Never mix them.

### Getting Demo API Keys

1. Log in to https://www.bitget.com
2. Toggle **Demo Trading** mode in the top navigation
3. Go to **Personal Center → API Key Management**
4. Create a new API key with Trade permissions
5. Save the credentials securely (they cannot be retrieved later)

---

## Required Environment Variables

### Credentials (required for any authenticated call)

| Variable | Purpose | Example |
|----------|---------|---------|
| `BITGET_API_KEY` | API key identifier | `bg_demo_abc123...` |
| `BITGET_SECRET_KEY` | Request signing secret | `demo_secret_xyz...` |
| `BITGET_PASSPHRASE` | API key passphrase | `your-passphrase` |

> **Security**: These values must NEVER be printed, logged, or committed to version control.

### Paper Trading Safety Flags (required to enable paper mode)

Set **ONE** of the following to explicitly enable paper trading:

| Variable | Value | Purpose |
|----------|-------|---------|
| `BITGET_MODE` | `paper` | Sets Bitget client to paper mode |
| `BITGET_PAPER_TRADING` | `true` | Explicit paper trading flag |
| `AGENTGUARD_ALLOW_PAPER_TRADING` | `true` | AgentGuard paper trading gate |

### Live Trading Gate (not implemented in Phase 5D)

| Variable | Value | Status |
|----------|-------|--------|
| `AGENTGUARD_ALLOW_LIVE_TRADING` | `true` | ⚠️ Live trading not implemented; setting this will trigger a warning |

---

## Safety Warnings

The preflight utility will display these warnings when applicable:

| Warning | When Shown | Action |
|---------|-----------|--------|
| "Live trading is not implemented in this phase." | `AGENTGUARD_ALLOW_LIVE_TRADING=true` | Remove the flag or wait for Phase 5E+ |
| "Paper trading requires Demo API keys from Bitget Demo mode." | Any paper flag is set | Ensure you are using Demo keys, not live keys |
| "Do not use live API keys for paper trading." | Any credential is present | Verify keys are from Demo mode |
| "Missing required paper trading safety flags." | Credentials present but no paper flags | Set one of the paper trading flags above |

---

## Using the Preflight Utility

### Programmatic Check

```typescript
import { inspectBitgetAuthEnv, assertCanUsePaperTrading } from "@agentguard/sdk";

// Safe inspection (never prints secrets)
const status = inspectBitgetAuthEnv();
console.log(`Can use paper: ${status.canUsePaperTrading}`);

// Assert with descriptive error if not ready
try {
  assertCanUsePaperTrading();
  // Proceed with authenticated paper-mode calls
} catch (error) {
  console.error(error.message);
  // Handle missing configuration
}
```

### CLI Demo

```bash
# Run the preflight check
npm run demo:bitget-auth-preflight

# Expected output:
# - Boolean status table (no secret values)
# - Warnings if configuration is incomplete
# - Clear next steps if paper trading is not enabled
```

---

## Setting Environment Variables

### Linux/macOS (bash)

```bash
export BITGET_API_KEY="your-demo-key"
export BITGET_SECRET_KEY="your-demo-secret"
export BITGET_PASSPHRASE="your-passphrase"
export BITGET_MODE=paper

# Run demo
npm run demo:bitget-auth-preflight
```

### Windows (PowerShell)

```powershell
$env:BITGET_API_KEY="your-demo-key"
$env:BITGET_SECRET_KEY="your-demo-secret"
$env:BITGET_PASSPHRASE="your-passphrase"
$env:BITGET_MODE="paper"

# Run demo
npm run demo:bitget-auth-preflight
```

### .env File (development only)

```env
# Bitget Demo API Credentials
BITGET_API_KEY=bg_demo_abc123...
BITGET_SECRET_KEY=demo_secret_xyz...
BITGET_PASSPHRASE=your-passphrase

# Paper Trading Mode
BITGET_MODE=paper

# AgentGuard Safety Gates
AGENTGUARD_ALLOW_PAPER_TRADING=true
# AGENTGUARD_ALLOW_LIVE_TRADING=false  # Do not enable in Phase 5D
```

> **Warning**: Never commit `.env` files with real credentials to version control. Add `.env` to `.gitignore`.

---

## Phase Roadmap

| Phase | Capability | Status |
|-------|-----------|--------|
| 5A | Discovery & documentation | ✅ Complete |
| 5B | Public read-only market data | ✅ Complete |
| 5C | Trading agent integration demo | ✅ Complete |
| **5D** | **Auth safety preflight** | **✅ This phase** |
| 5E | Authenticated paper-mode API calls | 📅 Planned |
| 5F | Paper trading order placement | 📅 Planned |
| 5G | Live trading with explicit opt-in | 📅 Future |

---

## Troubleshooting

### "Paper trading preflight failed: Missing required credentials"

**Cause**: One or more of `BITGET_API_KEY`, `BITGET_SECRET_KEY`, `BITGET_PASSPHRASE` is not set.

**Fix**: Set all three credentials using Demo API keys from Bitget Demo mode.

### "Paper trading preflight failed: Paper trading safety flags not set"

**Cause**: Credentials are present but no paper trading flag is enabled.

**Fix**: Set one of:
- `BITGET_MODE=paper`
- `BITGET_PAPER_TRADING=true`
- `AGENTGUARD_ALLOW_PAPER_TRADING=true`

### "Warning: Do not use live API keys for paper trading"

**Cause**: Credentials are detected but may be live keys.

**Fix**: Verify you are using Demo API keys (created in Bitget Demo mode), not live trading keys.

### "Warning: Live trading is not implemented in this phase"

**Cause**: `AGENTGUARD_ALLOW_LIVE_TRADING=true` is set.

**Fix**: Remove this flag. Live trading will be available in a future phase with additional safety gates.

---

## Security Checklist

- [ ] Never print API key values in logs or console output
- [ ] Never commit credentials to version control
- [ ] Use environment variables or secret management for credentials
- [ ] Verify Demo keys are used for paper trading, not live keys
- [ ] Keep `AGENTGUARD_ALLOW_LIVE_TRADING=false` until Phase 5G
- [ ] Review Bitget's official demo trading documentation for endpoint requirements

> **Final Reminder**: Phase 5D is a safety preflight utility only. No authenticated API calls are made. No orders are placed. No network requests occur. The utility prepares the foundation for safe paper trading integration in Phase 5E.
