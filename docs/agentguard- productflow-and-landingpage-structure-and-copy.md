# **Product UX Flow**

The PRD already has a strong flow: an AI agent creates an order intent, AgentGuard evaluates it, then approves, blocks, resizes, reduce-onlys, or flattens before forwarding to Bitget if safe.

Now we turn that into a clean demo experience.

## **Main user journey**

### **1\. Developer lands on AgentGuard**

They understand:

“This protects my AI trading agent before execution.”

CTA:

View demo  
Install SDK

### **2\. Developer sees the wrapper**

Show the simplest integration:

const guardedBitget \= createAgentGuardedClient(bitget, policy);

await guardedBitget.placeOrder(order);

The PRD says integration should take around 5-10 lines, which is a very strong hackathon success metric. Use that everywhere.

### **3\. Developer configures policy**

Show policy file as a visual card:

{  
 "maxLeverage": 5,  
 "maxOrderUsd": 250,  
 "maxDailyDrawdownPct": 3,  
 "onOversizedOrder": "resize",  
 "onExtremeVolatility": "block"  
}

### **4\. Agent attempts trades**

Demo scenarios:

* safe BTC order → approved  
* oversized SOL order → resized  
* 20x leverage trade → blocked  
* high volatility condition → blocked  
* drawdown breach → flat mode

### **5\. Dashboard shows proof**

The dashboard should answer one question:

What did AgentGuard stop, and why?

## **Key screens**

### **Screen 1: Dashboard overview**

Cards:

* Agent Status: Active / Paused / Flat Mode  
* Orders Evaluated  
* Approved  
* Resized  
* Blocked  
* Current Risk Mode  
* Daily Drawdown  
* Policy Health

Main visual:

**Live Order Stream**

Each row:

12:04:11  BTCUSDT  LONG  $180  3x  APPROVED  
12:05:42  SOLUSDT  LONG  $800  4x  RESIZED → $250  
12:06:10  ETHUSDT  LONG  $500  20x BLOCKED: max\_leverage\_exceeded

### **Screen 2: Policy config**

A friendly risk-policy editor.

Sections:

* Position limits  
* Leverage rules  
* Drawdown limits  
* Symbol allowlist  
* Volatility rules  
* Fail-closed behavior

The “fail closed” idea is extremely important. The PRD says unknown risk should be treated as unsafe, which is exactly the kind of serious infra decision judges will respect.

### **Screen 3: Replay mode**

This is the wow screen.

Title:

Replay: What would have happened without AgentGuard?

Split view:

Left:

Raw agent behavior

Right:

AgentGuard protected execution

Show prevented liquidation-style events, blocked overleverage, and reduced drawdown.

### **Screen 4: Event detail drawer**

When someone clicks a log row, open a drawer:

Decision: BLOCKED  
Reason: max\_position\_size\_exceeded

Requested order:  
SOLUSDT long  
$1,200 notional  
8x leverage

Policy:  
maxOrderUsd: $250  
maxLeverage: 5x

Action taken:  
Order blocked before execution

That’s extremely judge-friendly.

No ambiguity. No hand-wavy AI explanation.

Just proof.

## **Microcopy**

Use short, serious copy.

Examples:

Policy active  
Order intercepted  
Unsafe execution blocked  
Agent paused by drawdown rule  
Resize applied before exchange call  
Unknown risk state detected. Failing closed.

Empty state:

No trades evaluated yet.  
Run the demo agent to watch AgentGuard intercept execution decisions in real time.

Success state:

Trade approved.  
Order stayed inside policy limits.

Blocked state:

Trade blocked.  
The agent requested risk outside your policy.

Flat mode:

Flat mode active.  
New exposure is blocked. Position-reducing trades are still allowed.  
---

# **H. Landing Page Direction**

## **Hero section**

Headline:

The risk firewall for AI trading agents.

Subheadline:

AgentGuard sits between autonomous agents and Bitget execution APIs, blocking unsafe trades before they reach the exchange.

CTA buttons:

Run Demo  
View GitHub

Hero visual:

A horizontal trade pipeline:

AI Agent → AgentGuard → Bitget API

But AgentGuard is a glowing checkpoint in the middle.

Orders move through as small cards:

* approved card passes through green  
* resized card shrinks and passes through amber  
* blocked card hits a red stop line  
* flat mode locks the pipeline

This can be built quickly with CSS animations.

## **Landing page structure**

### **Section 1: Hero**

Make the category clear instantly.

### **Section 2: The problem**

Title:

AI agents can reason. They can also hallucinate.

Copy:

A trading agent can oversize a position, ignore volatility, over-leverage, or keep trading after a drawdown breach. AgentGuard adds deterministic policy enforcement before execution.

### **Section 3: How it works**

Use 3 cards:

1\. Intercept order  
2\. Evaluate policy  
3\. Approve, resize, block, or flatten

### **Section 4: Policy engine**

Show the JSON config.

This will make devs trust it fast.

### **Section 5: Live dashboard preview**

Show approved / resized / blocked event rows.

### **Section 6: Replay mode**

This is where you make judges lean in.

Title:

Prove what your agent would have done.

### **Section 7: Developer integration**

Show the 5-line wrapper.

### **Section 8: CTA**

Give your trading agent a hard risk boundary.  
