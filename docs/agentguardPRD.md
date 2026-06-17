## PRD Product Name: AgentGuard

**One-Liner:**  
AgentGuard is an open-source risk firewall SDK that sits between autonomous AI trading agents and Bitget execution APIs, preventing unsafe trades before they reach the exchange.

**Target Track:** Bitget AI Hackathon Track 2: Trading Infrastructure

**Problem:**  
AI trading agents can hallucinate, over-leverage, ignore volatility, or keep trading during abnormal market regimes. Developers need a deterministic safety layer that can enforce hard risk rules regardless of what the agent decides.

**Target Users:**  
AI trading agent developers, quant builders, prompt engineers, hackathon participants, and teams using Bitget Agent Hub, Bitget Playbook, MCP Server, or Bitget trading APIs.

**Core Value Proposition:**  
“Let your AI agent think, but never let it execute outside your risk policy.”

**MVP Features**

| Feature | Description | Priority |
| :---- | :---- | :---- |
| Bitget order wrapper | Intercepts order requests before API execution | Must |
| Policy config file | Defines max leverage, size, drawdown, volatility, and emergency rules | Must |
| Risk engine | Evaluates every trade against deterministic rules | Must |
| Decision actions | Approve, block, downsize, reduce-only, or flatten | Must |
| Event log | Records every decision with reason and timestamp | Must |
| Demo agent | Simple mock/real agent that attempts risky trades | Must |
| Dashboard | Shows approved, blocked, resized, and flat-mode events | Should |
| Replay mode | Runs historical/simulated trades through AgentGuard | Should |
| Sentiment adapter | Uses Bitget sentiment-analyst to detect stress regimes | Should |
| Technical adapter | Optional volatility/indicator filters via technical-analysis | Could |

**Key User Stories**

| User Story | Acceptance Criteria |
| :---- | :---- |
| As a developer, I can wrap my Bitget order calls with AgentGuard | Existing order payloads pass through guard.evaluateOrder() before execution |
| As a developer, I can define risk limits in a config file | Config supports position size, leverage, drawdown, symbol limits, and emergency mode |
| As a developer, I can block unsafe trades | Unsafe trades return blocked with a human-readable reason |
| As a developer, I can downsize risky trades | Oversized trades are resized to the maximum safe amount |
| As a developer, I can force reduce-only mode | New exposure is blocked while position-reducing trades are allowed |
| As a judge, I can see verifiable logs | Demo shows original order, policy decision, action taken, and result |
| As a judge, I can run the repo locally | README has install, config, demo, and dashboard commands |

**Success Criteria For Hackathon**

| Metric | Target |
| :---- | :---- |
| Setup time | Under 5 minutes |
| Demo clarity | Shows safe, blocked, resized, and flat-mode trades |
| Integration friction | 5-10 lines to wrap an existing agent order call |
| Open-source usefulness | Clear README, examples, config templates |
| Verifiable evidence | Simulated logs or replay proving prevented risky trades |

**Concrete Build Plan Recommended MVP Stack**

| Layer | Choice |
| :---- | :---- |
| SDK | TypeScript, Node.js |
| Config | JSON or YAML |
| Dashboard | Next.js |
| Styling | Tailwind CSS |
| Storage | Local storage then move to SupaBase |
| Charts | Lightweight chart/table UI |
| Integration | Bitget API wrapper plus mock Bitget client for demo |
| Optional hosted version | Supabase \+ Vercel |

**System Components**

| Component | Role |
| :---- | :---- |
| AgentGuard SDK | Main package developers import |
| Policy Engine | Evaluates orders against rules |
| Bitget Wrapper | Wraps Bitget order placement methods |
| Risk State Tracker | Tracks PnL, drawdown, exposure, and daily loss |
| Market Signal Adapter | Pulls sentiment/volatility risk context |
| Event Logger | Stores approved, blocked, resized, and emergency events |
| Replay Simulator | Replays risky orders through AgentGuard |
| Dashboard | Visualizes policy decisions and risk status |

**Order Flow**

AI Agent  
  \-\> creates order intent  
  \-\> AgentGuard middleware  
  \-\> policy engine checks risk  
  \-\> approve / block / resize / reduce-only / flatten  
  \-\> Bitget API if allowed  
  \-\> event log  
  \-\> dashboard

**Hackathon Timeline**

| Phase | Dates | Goal |
| :---- | :---- | :---- |
| Phase 1 | Jun 8-10 | SDK skeleton, policy config, mock order flow |
| Phase 2 | Jun 11-13 | Risk engine rules, approve/block/downsize actions |
| Phase 3 | Jun 14-16 | Bitget wrapper shape, demo agent, event logging |
| Phase 4 | Jun 17-19 | Dashboard with event timeline and policy status |
| Phase 5 | Jun 20-21 | Replay mode and risky scenario demos |
| Phase 6 | Jun 22-23 | README, examples, polish, tests |
| Phase 7 | Jun 24-25 | 3-minute video, final submission, GitHub cleanup |

**Demo Script**

1. Start with an agent attempting normal trades.  
2. AgentGuard approves safe trades.  
3. Agent attempts oversized leveraged trade.  
4. AgentGuard blocks it with reason: max\_position\_size\_exceeded.  
5. Agent attempts volatile-market trade.  
6. AgentGuard downsizes or blocks based on sentiment/volatility regime.  
7. Simulated drawdown crosses threshold.  
8. AgentGuard enters flat or reduce-only mode.  
9. Dashboard shows full audit trail.

**Middleware Wrapper For Bitget API Calls:** A middleware wrapper is a safety layer around the function that sends orders to Bitget.  
Normally, an agent might do this: await bitget.placeOrder(order);

**With AgentGuard, it becomes:**

const decision \= await guard.evaluateOrder(order, accountState, marketState);

if (decision.action \=== "approve") {  
  await bitget.placeOrder(order);  
}

if (decision.action \=== "resize") {  
  await bitget.placeOrder(decision.modifiedOrder);  
}

if (decision.action \=== "block") {  
  console.log(decision.reason);  
}

**The wrapper version makes it cleaner:**  
const guardedBitget \= createAgentGuardedClient(bitget, policy);

await guardedBitget.placeOrder(order);

Inside guardedBitget.placeOrder(), AgentGuard checks the order before forwarding it to Bitget.

**How To Find Bitget API Calls:** Look for where your agent calls order/execution functions. Common names may include:  
placeOrder()  
submitOrder()  
createOrder()  
openPosition()  
closePosition()  
setLeverage()

If using MCP Server, look for tool calls that execute trades. AgentGuard should sit before those calls, not after them.

**How To Use The Middleware Wrapper:** For the MVP, do not try to wrap all 58 Bitget APIs. Wrap the dangerous execution APIs first:

| API Type | Guard? | Reason |
| :---- | :---- | :---- |
| Place order | Yes | Main risk surface |
| Set leverage | Yes | Can increase liquidation risk |
| Close position | Usually allow | Needed for safety |
| Cancel order | Usually allow | Reduces risk |
| Get account | No | Read-only |
| Get market data | No | Read-only |

**Policy Config File**: A policy config file is where developers define the hard risk limits AgentGuard enforces.  
Example:  
{  
  "mode": "active",  
  "maxLeverage": 5,  
  "maxPositionUsd": 1000,  
  "maxOrderUsd": 250,  
  "maxDailyDrawdownPct": 3,  
  "maxTotalDrawdownPct": 8,  
  "maxSymbolExposurePct": 30,  
  "allowedSymbols": \["BTCUSDT", "ETHUSDT", "SOLUSDT"\],  
  "blockedSymbols": \[\],  
  "volatility": {  
    "enabled": true,  
    "maxFundingRateAbs": 0.05,  
    "blockWhenSentimentExtreme": true  
  },  
  "actions": {  
    "onOversizedOrder": "resize",  
    "onDrawdownBreach": "flat",  
    "onExtremeVolatility": "block",  
    "onUnknownRiskState": "block"  
  }  
}

**How To Use It:** The developer loads it when initializing AgentGuard:

const policy \= await loadPolicy("./agentguard.policy.json");

const guard \= new AgentGuard({  
  policy,  
  bitgetClient,  
  marketSignalProvider,  
  eventLogger  
});  
Then every order gets evaluated against that policy.

**Best MVP Policy Rules**

| Rule | Example Behavior |
| :---- | :---- |
| Max order size | Resize or block orders above $250 |
| Max leverage | Block leverage above 5x |
| Max daily drawdown | Enter flat mode after 3% daily loss |
| Max total drawdown | Pause agent after 8% loss |
| Symbol allowlist | Only trade BTCUSDT, ETHUSDT, SOLUSDT |
| Extreme sentiment | Block new positions during high-risk market stress |
| Unknown account state | Fail closed and block order |

**Important Design Choice**: AgentGuard should be “fail closed,” not “fail open.”  
That means if account state, policy state, or market risk data is missing, AgentGuard should block new risky orders by default. For a risk firewall, unknown risk should be treated as unsafe.

**Recommended Repo Structure:**

agentguard/  
  packages/  
    sdk/  
      src/  
        guard.ts  
        policy.ts  
        risk-engine.ts  
        bitget-wrapper.ts  
        event-logger.ts  
        types.ts  
    demo-agent/  
      src/  
        index.ts  
        scenarios.ts  
  apps/  
    dashboard/  
      src/  
  examples/  
    basic-wrapper/  
    replay-simulation/  
  docs/  
    PRD.md  
    ARCHITECTURE.md  
  agentguard.policy.example.json  
  [README.md](http://README.md)

**Best Next Step:** The highest-leverage next step is to create the repo structure, SDK interface, example policy config, and a fake Bitget client first. That gives you a runnable demo quickly before adding real Bitget integration.  
