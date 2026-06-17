# AgentGuard

Risk firewall for autonomous trading agents.

AgentGuard is a Bitget AI Hackathon Track 2 trading infrastructure project. It is an installable TypeScript SDK that sits between AI trading agents and Bitget-style execution clients, checking every order intent against deterministic risk policy before anything can reach execution.

## Problem

Autonomous trading agents can generate unsafe orders: oversized positions, excessive leverage, unsupported symbols, or trades during abnormal market regimes. LLM reasoning is useful for strategy, but it is not a reliable place to enforce hard risk controls.

Developers need infrastructure that makes risk rules deterministic, auditable, and impossible for an agent prompt to bypass.

## Solution

AgentGuard wraps an execution client with a policy engine. The agent can still generate trade intent, but AgentGuard decides whether the order is approved, resized, blocked, flattened, or paused before the execution layer receives it.

The SDK is packable as `@agentguard/sdk` for local installation and demo review.

## How It Works

```text
AI agent
  -> OrderIntent
  -> AgentGuard policy check
  -> approve / resize / block / flatten / pause
  -> dry-run or gated execution adapter
  -> audit event log
```

AgentGuard currently supports:

- Policy loading and validation
- Deterministic risk evaluation
- Fail-closed behavior when risk state is unknown
- Market-risk rules from normalized market state
- Event logging for audit and dashboard data
- Bitget-shaped dry-run adapter
- Read-only Bitget public market data provider
- Optional read-only paper auth probe

## What Is Real Today

- SDK core works.
- Policy loading and validation work.
- Risk engine works.
- Event logging works.
- Bitget dry-run adapter works.
- Market-risk rules work.
- Bitget public read-only market data provider works.
- Trading agent integration demo works.
- Dashboard data generation works.
- SDK packaging works through `@agentguard/sdk`.
- Paper read-only account probe is available as an optional credential check.

No live trading is implemented. Paper order placement is not enabled by default.

## Quickstart

```bash
npm install
npm run demo:judge
npm run sdk:pack
```

`demo:judge` does not require private Bitget API keys. It runs the main trading-agent dry-run demo, regenerates dashboard sample data, and builds the SDK.

The SDK pack command creates:

```text
agentguard-sdk-0.1.0.tgz
```

Install the packed SDK in another project with:

```bash
npm install ./agentguard-sdk-0.1.0.tgz
```

## Optional Paper Auth

```bash
npm run demo:paper-auth
```

This optional probe requires Bitget Demo API keys and paper env flags. It calls a read-only paper account endpoint with `paptrading: 1`, prints only safe metadata, and does not place orders.

## Safety Guarantees

- Judge demo does not require private keys.
- Dry-run execution does not send Bitget orders.
- Blocked orders do not reach execution.
- Live trading is not implemented.
- Paper order placement is not enabled by default.
- Secrets are not printed by paper auth diagnostics.
- `.env` files should never be committed.

## Track 2 Relevance

AgentGuard is trading infrastructure, not a trading strategy. It gives AI trading developers a reusable middleware layer for policy enforcement, exchange adapter safety, audit logs, dashboard evidence, and future paper/live execution gates.

The core value is preventing unsafe autonomous execution before it reaches Bitget-style trading APIs.
