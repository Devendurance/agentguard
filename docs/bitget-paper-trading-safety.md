# Bitget Paper Trading Safety

> **Phase 5E: Authenticated Paper-Mode Read-Only Account Probe** — This phase verifies Demo API credentials via authenticated read-only calls. No orders are placed.

## Overview

This document explains the safety preflight checks and authenticated read-only account probe for Bitget paper trading integration with AgentGuard.

### What Phase 5E Does

✓ Checks whether required environment variables are present  
✓ Verifies paper trading safety flags are explicitly set  
✓ Reports missing credentials or misconfiguration  
✓ Makes authenticated read-only API calls to Bitget Demo endpoints  
✓ Includes `paptrading: 1` header for all demo API requests  
✓ **Does NOT** print API key values or secrets  
✓ **Does NOT** place orders or call mutating endpoints  

### What Phase 5E Does NOT Do

✗ Place any trades (paper or live)  
✗ Call order placement, cancel order, or close position endpoints  
✗ Call transfer, withdraw, or leverage adjustment endpoints  
✗ Use API keys for live trading  
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
| `BITGET_SECRET_KEY` | Request signing secret (canonical) | `demo_secret_xyz...` |
| `BITGET_API_SECRET` | Request signing secret (alias) | `demo_secret_xyz...` |
| `BITGET_PASSPHRASE` | API key passphrase | `your-passphrase` |

> **Security**: These values must NEVER be printed, logged, or committed to version control.  
> **Note**: `BITGET_SECRET_KEY` is the canonical name. `BITGET_API_SECRET` is accepted as an alias for compatibility.

### Paper Trading Safety Flags (ALL required to enable paper mode)

Set **ALL** of the following to explicitly enable paper trading:

| Variable | Value | Purpose |
|----------|-------|---------|
| `BITGET_MODE` | `paper` | Sets Bitget client to paper mode |
| `BITGET_PAPER_TRADING` | `true` | Explicit paper trading flag |
| `AGENTGUARD_ALLOW_PAPER_TRADING` | `true` | AgentGuard paper trading gate |

> **Critical**: All three flags must be set together. Setting only one or two is insufficient for AgentGuard safety.

### Live Trading Gate (not implemented in Phase 5E)

| Variable | Value | Status |
|----------|-------|--------|
| `AGENTGUARD_ALLOW_LIVE_TRADING` | `true` | ⚠️ Live trading not implemented; setting this will trigger a warning |

### Optional Display Flags

| Variable | Value | Purpose |
|----------|-------|---------|
| `BITGET_PRINT_PAPER_BALANCES` | `true` | Show balance values in demo output (hidden by default) |

---

## Safety Warnings

The preflight utility will display these warnings when applicable:

| Warning | When Shown | Action |
|---------|-----------|--------|
| "Live trading is not implemented in this phase." | `AGENTGUARD_ALLOW_LIVE_TRADING=true` | Remove the flag or wait for Phase 5F+ |
| "Paper trading requires Bitget Demo API keys." | All paper flags are set | Ensure you are using Demo keys, not live keys |
| "Do not use live API keys for paper trading." | Any credential is present | Verify keys are from Demo mode, not live trading |
| "All paper trading safety flags must be enabled together." | Credentials present but incomplete paper flags | Set ALL three: BITGET_MODE=paper, BITGET_PAPER_TRADING=true, AGENTGUARD_ALLOW_PAPER_TRADING=true |

---

## Phase 5E: Authenticated Read-Only Account Probe

### Endpoint Details

- **Method**: `GET`
- **Path**: `/api/v2/spot/account/assets`
- **Header**: `paptrading: 1` (required for demo mode)
- **Query**: Optional `coin={symbol}` to filter by asset

### Response Handling

- Returns list of assets with coin name, available, frozen, locked balances
- By default, only coin names are printed (balance values hidden)
- Set `BITGET_PRINT_PAPER_BALANCES=true` to show balance values in demo output
- Response includes: mode, endpoint, paptrading header confirmation, asset count, sanitized asset list

### Safety Guarantees

✓ Read-only endpoint only — no order placement possible  
✓ Extra path validation blocks mutating endpoints (`/order`, `/trade`, `/transfer`, `/withdraw`, `/leverage`, `/close`)  
✓ HMAC-SHA256 signing using Node.js `crypto` module only  
✓ No secret values ever printed to console  
✓ `paptrading: 1` header always included for demo mode compliance  

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

### Using the Paper Read-Only Client

```typescript
import { BitgetPaperReadOnlyClient } from "@agentguard/sdk";

const client = new BitgetPaperReadOnlyClient();
const result = await client.getSpotAccountAssets("USDT");

console.log(`Found ${result.assetCount} assets`);
console.log(`paptrading header used: ${result.paptradingHeader}`);
console.log(result.note); // "Authenticated paper-mode read-only account probe. No orders were placed."
```

### CLI Demos

```bash
# Run the preflight check
npm run demo:bitget-auth-preflight

# Run the authenticated account probe
npm run demo:bitget-paper-account-probe

# Optional: Show balance values in output
$env:BITGET_PRINT_PAPER_BALANCES="true"
npm run demo:bitget-paper-account-probe
```

---

## Setting Environment Variables

### Linux/macOS (bash)

```bash
export BITGET_API_KEY="your-demo-key"
export BITGET_SECRET_KEY="your-demo-secret"
export BITGET_PASSPHRASE="your-passphrase"
export BITGET_MODE=paper
export BITGET_PAPER_TRADING=true
export AGENTGUARD_ALLOW_PAPER_TRADING=true

# Optional: Show balance values in demo output
export BITGET_PRINT_PAPER_BALANCES=true

# Run demos
npm run demo:bitget-auth-preflight
npm run demo:bitget-paper-account-probe
```

### Windows (PowerShell)

```powershell
$env:BITGET_API_KEY="your-demo-key"
$env:BITGET_SECRET_KEY="your-demo-secret"
$env:BITGET_PASSPHRASE="your-passphrase"
$env:BITGET_MODE="paper"
$env:BITGET_PAPER_TRADING="true"
$env:AGENTGUARD_ALLOW_PAPER_TRADING="true"

# Optional: Show balance values in demo output
$env:BITGET_PRINT_PAPER_BALANCES="true"

# Run demos
npm run demo:bitget-auth-preflight
npm run demo:bitget-paper-account-probe
```

### .env File (development only)

```env
# Bitget Demo API Credentials
BITGET_API_KEY=bg_demo_abc123...
BITGET_SECRET_KEY=demo_secret_xyz...
# BITGET_API_SECRET=alternate_secret  # Alias accepted if BITGET_SECRET_KEY not set
BITGET_PASSPHRASE=your-passphrase

# Paper Trading Mode (ALL three required)
BITGET_MODE=paper
BITGET_PAPER_TRADING=true
AGENTGUARD_ALLOW_PAPER_TRADING=true

# Optional: Show balance values in demo output
# BITGET_PRINT_PAPER_BALANCES=true

# AgentGuard Safety Gates
# AGENTGUARD_ALLOW_LIVE_TRADING=false  # Do not enable in Phase 5E
```

> **Warning**: Never commit `.env` files with real credentials to version control. Add `.env` to `.gitignore`.

---

## Phase Roadmap

| Phase | Capability | Status |
|-------|-----------|--------|
| 5A | Discovery & documentation | ✅ Complete |
| 5B | Public read-only market data | ✅ Complete |
| 5C | Trading agent integration demo | ✅ Complete |
| 5D | Auth safety preflight | ✅ Complete |
| **5E** | **Authenticated paper-mode read-only account probe** | **✅ This phase** |
| 5F | Paper trading order placement | 📅 Planned |
| 5G | Live trading with explicit opt-in | 📅 Future |

---

## Troubleshooting

### "Paper trading preflight failed: Missing required credentials"

**Cause**: One or more of `BITGET_API_KEY`, `BITGET_SECRET_KEY` (or `BITGET_API_SECRET`), `BITGET_PASSPHRASE` is not set.

**Fix**: Set all three credentials using Demo API keys from Bitget Demo mode.

### "Paper trading preflight failed: Set ALL required paper trading safety flags"

**Cause**: Credentials are present but not all three paper trading flags are enabled.

**Fix**: Set ALL of:
- `BITGET_MODE=paper`
- `BITGET_PAPER_TRADING=true`
- `AGENTGUARD_ALLOW_PAPER_TRADING=true`

### "Request failed: 401 Unauthorized" or signature errors

**Cause**: 
- Wrong demo key (created in live mode instead of demo mode)
- Live API key used instead of demo key
- Timestamp/signature mismatch (check system clock)
- Missing `paptrading: 1` header

**Fix**: 
- Verify keys were created in Bitget Demo mode
- Ensure system clock is synchronized
- Confirm `paptrading: 1` header is included (client handles this automatically)

### "Request failed: IP restriction" or "API key not authorized"

**Cause**: API key has IP whitelist restrictions that don't include your current IP.

**Fix**: Update API key settings in Bitget to allow your IP, or remove IP restrictions for testing.

### "Warning: Do not use live API keys for paper trading"

**Cause**: Credentials are detected but may be live keys.

**Fix**: Verify you are using Demo API keys (created in Bitget Demo mode), not live trading keys. Never use live API keys for paper mode.

### "Warning: All paper trading safety flags must be enabled together"

**Cause**: Credentials present but only some paper trading flags are set.

**Fix**: Enable ALL three paper trading safety flags together. Partial configuration is not sufficient for AgentGuard safety.

---

## Security Checklist

- [ ] Never print API key values in logs or console output
- [ ] Never commit credentials to version control
- [ ] Use environment variables or secret management for credentials
- [ ] Verify Demo keys are used for paper trading, not live keys
- [ ] Keep `AGENTGUARD_ALLOW_LIVE_TRADING=false` until Phase 5G
- [ ] Set ALL three paper trading flags: BITGET_MODE=paper, BITGET_PAPER_TRADING=true, AGENTGUARD_ALLOW_PAPER_TRADING=true
- [ ] Include `paptrading: 1` header for all demo API requests (client handles this)
- [ ] Review Bitget's official demo trading documentation for endpoint requirements
- [ ] Balance values hidden by default; set `BITGET_PRINT_PAPER_BALANCES=true` only for debugging

> **Final Reminder**: Phase 5E is an authenticated read-only account probe only. No orders are placed. No mutating endpoints are called. The `paptrading: 1` header ensures all requests target Bitget Demo mode. This phase prepares the foundation for safe paper trading order placement in Phase 5F.


---

## Troubleshooting: Structured Error Diagnostics

The `BitgetPaperReadOnlyClient` returns structured safe errors to help diagnose failures without exposing secrets.

### Error Stages

| Stage | Description | Likely Cause |
|-------|-------------|--------------|
| `preflight` | Paper trading config check failed | Missing env vars or paper flags |
| `network` | Fetch/network layer failure | No internet, DNS, firewall, proxy, Bitget down |
| `http` | HTTP response not OK (4xx/5xx) | Auth error, bad signature, invalid key, IP restriction |
| `parse` | Response JSON parse failed | Unexpected endpoint response format |
| `unknown` | Unrecognized error type | Check full error message for details |

### Common Error Patterns

#### `fetch failed` (network stage)

**Symptoms**: Error with `stage: network`, `causeName: TypeError` or `FetchError`

**Likely causes**:
- No internet connection
- DNS resolution failure for `api.bitget.com`
- Corporate firewall or proxy blocking the request
- Bitget API temporarily unavailable
- System clock skew affecting TLS handshake

**Fix**:
```powershell
# Test connectivity
Test-Connection api.bitget.com

# Check DNS
Resolve-DnsName api.bitget.com

# Verify system time
Get-Date
```

#### HTTP 401/400 (http stage)

**Symptoms**: `status: 401` or `status: 400`, possibly with Bitget `code`

**Likely causes**:
- Signature calculation error (wrong secret, wrong payload format)
- Timestamp too far from server time (>5 min skew)
- Demo API key used with live endpoint or vice versa
- Missing or wrong `ACCESS-PASSPHRASE`
- Malformed request headers

**Fix**:
- Verify system clock is synchronized
- Confirm using Demo keys from Bitget Demo mode
- Check `BITGET_PASSPHRASE` matches API key settings
- Enable `debugSafe: true` to verify headers are being set

#### Bitget auth error code (http stage with code)

**Symptoms**: `code: "40001"` or similar auth-related code, `message: "Invalid access key"`

**Likely causes**:
- Live API key used instead of Demo key
- Demo key not authorized for paper trading endpoints
- IP whitelist restriction on API key
- Missing `paptrading: 1` header (client includes this automatically)

**Fix**:
- Log in to Bitget Demo mode and verify key was created there
- Check API key IP restrictions in Bitget dashboard
- Ensure `paptrading: 1` header is present (use `debugSafe: true` to confirm)

#### Wrong demo/live key mismatch

**Symptoms**: Auth errors despite correct-looking credentials

**Likely causes**:
- Key created in live mode but used with `paptrading: 1` header
- Key created in demo mode but used without `paptrading: 1` header
- Mixing credentials from different modes

**Fix**:
- Demo keys: Created in Bitget Demo mode, require `paptrading: 1` header
- Live keys: Created in live mode, must NOT use `paptrading: 1` header
- Never mix demo and live credentials

#### IP whitelist restriction

**Symptoms**: HTTP 401/403 with IP-related message

**Likely causes**:
- API key has IP whitelist enabled
- Current IP not in whitelist

**Fix**:
- Add current IP to API key whitelist in Bitget dashboard
- Or temporarily disable IP restriction for testing

#### System clock/timestamp mismatch

**Symptoms**: HTTP 400 with timestamp-related error

**Likely causes**:
- Local system clock differs from Bitget server by >5 minutes
- NTP not synchronized

**Fix**:
```powershell
# Sync Windows time
w32tm /resync

# Verify time
Get-Date
```

#### paptrading header missing

**Symptoms**: Auth error when using Demo keys

**Likely causes**:
- `paptrading: 1` header not included in request

**Fix**:
- `BitgetPaperReadOnlyClient` automatically includes `paptrading: 1`
- If customizing headers, ensure this header is present for Demo mode

---

## Using debugSafe Mode

For additional diagnostics without exposing secrets, enable `debugSafe`:

```typescript
const client = new BitgetPaperReadOnlyClient({ debugSafe: true });
```

This logs safe request metadata:
- `baseUrl`: API endpoint base URL
- `endpoint`: Request path
- `method`: HTTP method
- `paptrading header present`: Boolean
- `has access key header`: Boolean (presence only)
- `has signature header`: Boolean (presence only)
- `timestamp length`: Length of timestamp string

**Never prints**: actual API key, secret, passphrase, or signature values.

---

## Running Diagnostics

```bash
# 1. Test public connectivity first
npm run demo:bitget-paper-connectivity

# 2. Verify auth preflight
npm run demo:bitget-auth-preflight

# 3. Run authenticated account probe with safe diagnostics
npm run demo:bitget-paper-account-probe

# 4. Optional: Enable debugSafe for more metadata
# Edit examples/bitget-paper-account-probe/index.ts:
# new BitgetPaperReadOnlyClient({ debugSafe: true })
```

### Expected Outputs

**Success**:
```
✓ Request succeeded
=== Probe Result (sanitized) ===
  mode: paper
  endpoint: /api/v2/spot/account/assets
  paptrading header used: yes
  response code: 00000
  asset count: N
```

**Failure with structured error**:
```
✗ Request failed
=== Structured Error Details ===
  stage: http
  HTTP status: 401
  Bitget code: 40001
  cause: Invalid access key

  Likely fix: Verify demo API key (not live key), IP whitelist settings, or paptrading:1 header
```

---

## Security Reminders

- Error messages never include API key values, secrets, or signatures
- Response previews are truncated to 500 characters maximum
- `debugSafe` mode logs only boolean presence checks, never actual values
- Always use Demo API keys for paper mode testing
- Keep `AGENTGUARD_ALLOW_LIVE_TRADING=false` until Phase 5G

> **Final Reminder**: Phase 5E is an authenticated read-only account probe only. No orders are placed. No mutating endpoints are called. Structured safe errors help diagnose issues without compromising credential security.
