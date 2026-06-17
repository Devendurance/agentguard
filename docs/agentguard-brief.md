## Idea Details and Brief

[AgentGuard PRD](https://docs.google.com/document/d/14BCMdg-KUBCAAwEFW6yHdR9tF8F9I6XPl29KRJRm8Oc/edit?usp=sharing)

**Final Refined Idea**  
AgentGuard: Open-Source Risk Firewall for AI Trading Agents  
AgentGuard is an open-source middleware SDK that sits between autonomous AI trading agents and Bitget trading execution APIs. It acts as a deterministic safety layer that prevents hallucinated, oversized, overleveraged, or volatility-blind trades from reaching the exchange.  
Before any order is sent through Bitget Agent Hub, MCP Server, or Bitget’s 58 trading APIs, AgentGuard intercepts the request and evaluates it against a configurable risk policy.  
It checks:

* Maximum position size  
* Leverage limits  
* Per-trade loss exposure  
* Daily drawdown  
* Current simulated and realized PnL  
* Portfolio concentration  
* Volatility regime  
* Sentiment/funding stress via sentiment-analyst  
* Optional technical risk filters via technical-analysis  
* Emergency market conditions from news/sentiment feeds

If the trade violates policy, AgentGuard can:

* Block the order  
* Downsize the order  
* Convert market orders to safer limit orders  
* Force reduce-only mode  
* Trigger a full flat regime  
* Pause the agent  
* Emit an auditable risk event log

The project includes:

* TypeScript SDK  
* Middleware wrapper for Bitget API calls  
* Policy config file  
* Risk simulator  
* Demo agent integration  
* Web dashboard showing blocked, resized, and approved trades  
* Replay mode proving how AgentGuard would have prevented liquidation events in backtests

Positioning For Bitget Hackathon  
This is highly aligned with Track 2: Trading Infrastructure.  
It is not a trading strategy. It is safety infrastructure that other agent developers can integrate with low friction. It directly solves one of the biggest blockers to autonomous trading adoption: trusting agents with execution permissions.  
Final PMF Scores

| Dimension | Score |
| :---- | :---- |
| Problem Clarity | 9.8/10 |
| Market Size | 9.4/10 |
| Uniqueness | 9.4/10 |
| Feasibility | 9.5/10 |
| Monetization | 9.2/10 |
| Timing | 9.9/10 |
| Virality | 9.2/10 |
| Defensibility | 9.3/10 |
| Team Fit | 9.7/10 |
| Ralph Factor | 9.8/10 |

Final Average: 9.5/10  
Why This Beats The Original  
The original idea was good but slightly generic: “a circuit breaker module.”  
The refined version is stronger because it becomes:

* A developer SDK, not just a feature  
* A Bitget-native middleware layer  
* A risk policy engine  
* A replayable audit tool  
* A demoable hackathon project  
* A reusable open-source infrastructure primitive

Best Demo Angle  
Show a simple AI trading agent attempting risky trades during high-volatility conditions. Then show AgentGuard intercepting them in real time:

1. Trade approved  
2. Trade downsized  
3. Trade blocked  
4. Agent forced into flat mode  
5. Dashboard shows exact rule that triggered

This is probably stronger for Track 2 than the “Why Engine” because risk management is easier to demo, easier to judge, and has clearer infrastructure value.

