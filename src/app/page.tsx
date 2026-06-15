import type { ReactNode } from "react";
import Image from "next/image";
import { RevealOnScroll } from "./reveal-on-scroll";

const statusItems = [
  "Open-source SDK",
  "Policy engine",
  "Bitget wrapper",
  "Replay logs",
];

const pipelineSteps = [
  ["→", "Agent Intent", "Trade submitted by agent", "approved"],
  ["⊕", "Order Parsed", "Size, symbol, leverage extracted", "approved"],
  ["⚑", "Policy Check", "Rules evaluated in sequence", "warning"],
  ["≡", "Risk Decision", "Approve · Resize · Block", "warning"],
  ["✓", "Execution", "Approved order sent to Bitget", "approved"],
  ["◎", "Audit Log", "Decision written and replayable", "audit"],
];

const incidentRows = [
  ["14:31:02.117", "agent_12", "ETHUSDT-PERP", "LONG $180k", "max_leverage", "BLOCKED", "15× > 5× limit", "blocked"],
  ["14:28:44.882", "agent_07", "BTCUSDT-PERP", "LONG $42k", "max_position", "RESIZED", "$42k → $18.5k", "warning"],
  ["14:21:19.005", "agent_03", "BTCUSDT-PERP", "SHORT $8k", "—", "APPROVED", "all policies passed", "approved"],
  ["14:09:55.341", "agent_02", "ALL POSITIONS", "CLOSE ALL", "daily_loss", "FLATTENED", "$62.4k > $40k", "blocked"],
];

const policyCards = [
  ["Max Position Size", "Caps notional size. Oversized orders are downsized to the configured limit before execution.", "$20,000", "resize", "warning"],
  ["Daily Loss Limit", "When cumulative daily losses hit the threshold, all positions flatten and the agent pauses.", "$40,000", "flatten", "blocked"],
  ["Kill Switch", "When activated, all positions flatten immediately and new orders are rejected until reset.", "inactive", "standby", "neutral"],
];

function Chip({ variant, children }: { variant: string; children: ReactNode }) {
  return (
    <span className={`ag-chip ag-chip-${variant}`}>
      <span aria-hidden="true" className="ag-chip-dot" />
      {children}
    </span>
  );
}

function PanelChrome({ title, meta }: { title: string; meta?: ReactNode }) {
  return (
    <div className="ag-panel-bar">
      <div aria-hidden="true" className="flex gap-1.5">
        <span className="size-2 rounded-full bg-[rgba(244,63,94,.7)]" />
        <span className="size-2 rounded-full bg-[rgba(251,191,36,.65)]" />
        <span className="size-2 rounded-full bg-[rgba(74,222,128,.65)]" />
      </div>
      <span className="ag-mono text-[10px] text-[var(--ag-muted)]">{title}</span>
      {meta ?? <span className="w-12" aria-hidden="true" />}
    </div>
  );
}

export default function Home() {
  return (
    <div className="ag-site">
      <header className="ag-nav">
        <nav className="ag-container flex min-h-16 items-center justify-between gap-4 py-3" aria-label="Primary navigation">
          <a href="#top" className="ag-nav-brand" aria-label="AgentGuard home">
            <Image className="ag-nav-wordmark" src="/agentguard-wordmark-transparent.png" alt="AgentGuard" width={2083} height={233} priority />
            <span className="ag-mono hidden text-[10px] uppercase text-[var(--ag-muted)] sm:block">risk firewall sdk</span>
          </a>
          <ul className="hidden items-center gap-7 md:flex">
            {[
              ["Problem", "#problem"],
              ["Policy Engine", "#policy"],
              ["Replay Mode", "#replay"],
              ["SDK", "#sdk"],
            ].map(([label, href]) => (
              <li key={href}>
                <a className="text-xs font-medium text-[var(--ag-muted)] transition-colors hover:text-[var(--ag-text)]" href={href}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a className="ag-btn ag-btn-secondary hidden sm:inline-flex" href="#github">GitHub</a>
            <a className="ag-btn ag-btn-primary" href="#demo">Run Demo</a>
          </div>
        </nav>
      </header>

      <main id="top">
        <RevealOnScroll />
        <section className="ag-hero ag-section">
          <div className="ag-container ag-hero-grid grid items-center gap-12 lg:grid-cols-[5fr_7fr]">
            <div className="ag-hero-copy">
              <p className="ag-hero-kicker mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(74,222,128,.22)] bg-[rgba(74,222,128,.08)] px-3 py-1.5">
                <span className="size-1.5 rounded-full bg-[var(--ag-green)]" aria-hidden="true" />
                <span className="ag-mono text-[10px] font-medium text-[var(--ag-green)]">v0.4.2 — public beta</span>
              </p>
              <h1 className="ag-hero-headline ag-display max-w-[720px] text-balance text-5xl leading-none text-[var(--ag-text)] sm:text-6xl lg:text-[76px]">
                The risk firewall for <em className="text-[var(--ag-muted)]">autonomous</em> trading agents.
              </h1>
              <p className="ag-hero-subcopy mt-6 max-w-md text-pretty text-base leading-7 text-[var(--ag-muted)] sm:text-lg">
                AgentGuard sits between autonomous agents and Bitget execution APIs, blocking unsafe trades before they reach the exchange.
              </p>
              <div className="ag-hero-actions mt-8 flex flex-col gap-3 sm:flex-row">
                <a className="ag-btn ag-btn-primary ag-btn-lg" href="#demo">Run Demo →</a>
                <a className="ag-btn ag-btn-developer ag-btn-lg" href="#github">View GitHub</a>
              </div>
              <ul className="ag-hero-status mt-8 flex flex-wrap gap-x-0 gap-y-3" aria-label="AgentGuard capabilities">
                {statusItems.map((item, index) => (
                  <li key={item} className="flex items-center gap-2 pr-4 text-[10px] text-[var(--ag-muted)] sm:mr-4 sm:border-r sm:border-[var(--ag-border-soft)] last:mr-0 last:border-r-0">
                    <span aria-hidden="true" className="size-1 rounded-full bg-[var(--ag-green)]" />
                    <span className="ag-mono">{item}</span>
                    <span className="sr-only">{index + 1}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ag-hero-visual">
              <Image
                className="ag-hero-robot"
                src="/agentguard-hero-mascot.png"
                alt=""
                aria-hidden="true"
                width={746}
                height={1001}
                sizes="(max-width: 900px) 420px, 480px"
                priority
              />
              <span className="ag-hero-touch" aria-hidden="true" />
              <section className="ag-panel ag-hero-checkpoint" aria-labelledby="checkpoint-title">
                <PanelChrome
                  title="agentguard.checkpoint — trade_eval"
                  meta={<span className="ag-mono text-[9px] text-[var(--ag-muted)] tabular-nums">14:23:07</span>}
                />
                <div className="ag-hero-summary">
                  <div className="ag-hero-stage ag-hero-stage-order">
                    <h2 id="checkpoint-title" className="ag-label">Incoming order</h2>
                    <p className="ag-mono mt-1.5 text-xs font-semibold text-[var(--ag-text)]">
                      BTCUSDT-PERP <span className="text-[var(--ag-green)]">· LONG</span> <span className="text-[var(--ag-amber)]">$42k</span>
                    </p>
                  </div>
                  <div className="ag-hero-stage ag-hero-stage-policies">
                    <div className="flex items-center justify-between gap-3">
                      <span className="ag-label">Policy checks</span>
                      <span className="ag-mono text-[9px] text-[var(--ag-green)]">3 passed · 1 resize</span>
                    </div>
                    <span className="ag-hero-progress" aria-hidden="true"><span /></span>
                  </div>
                  <div className="ag-hero-stage ag-hero-stage-decision flex items-center justify-between gap-3">
                    <span className="ag-label">Decision</span>
                    <strong className="ag-mono text-[11px] text-[var(--ag-amber)]">RESIZED → $18.5k</strong>
                  </div>
                  <div className="ag-hero-stage ag-hero-stage-audit flex items-center justify-between gap-3">
                    <span className="ag-mono text-[9px] text-[var(--ag-blue)]">audit evt_9f3c2a · logged</span>
                    <span className="ag-mono text-[9px] text-[var(--ag-muted)]">checkpoint complete</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section id="problem" className="ag-section ag-border-section">
          <div className="ag-container">
            <p className="ag-eyebrow">The Problem</p>
            <h2 className="ag-section-title max-w-3xl">AI agents can reason. They can also trade past your risk.</h2>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[var(--ag-muted)]">
              A trading agent can oversize a position, ignore volatility, over-leverage, or keep trading after a drawdown breach. AgentGuard adds deterministic policy enforcement before execution, so unsafe orders are caught before they touch the market.
            </p>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <article className="ag-panel">
                <div className="ag-panel-bar"><span className="ag-label">Unsafe Agent Order</span><Chip variant="blocked">unprotected</Chip></div>
                <dl className="space-y-3 p-5">
                  {[["Market", "ETHUSDT-PERP", ""], ["Size", "$180,000 (18× limit)", "text-[var(--ag-red)]"], ["Leverage", "15× (max: 5×)", "text-[var(--ag-red)]"], ["Daily Loss", "$62,400 / $40k limit", "text-[var(--ag-red)]"]].map(([label, value, className]) => (
                    <div key={label} className="flex items-center justify-between gap-4 rounded-lg border border-[var(--ag-border)] bg-[var(--ag-raised)] px-4 py-3">
                      <dt className="ag-mono text-xs text-[var(--ag-muted)]">{label}</dt>
                      <dd className={`ag-mono text-right text-xs font-semibold tabular-nums text-[var(--ag-text)] ${className}`}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
              <article className="ag-panel">
                <div className="ag-panel-bar"><span className="ag-label">Policy Failure Report</span><Chip variant="blocked">3 violations</Chip></div>
                <div className="space-y-2 p-5">
                  {[["Position Too Large", "$180k > $10k"], ["Leverage Exceeds Limit", "15× > 5×"], ["Drawdown Breach Active", "$62.4k > $40k"]].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 rounded-lg border border-[rgba(244,63,94,.25)] bg-[rgba(244,63,94,.06)] px-4 py-3">
                      <span className="ag-mono text-xs text-[var(--ag-text)]"><span className="text-[var(--ag-red)]">✕</span> {label}</span>
                      <span className="ag-mono text-right text-[10px] text-[var(--ag-red)] tabular-nums">{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-[var(--ag-border-soft)] pt-4">
                    <span className="ag-mono text-[10px] text-[var(--ag-muted)]">Final Action</span>
                    <Chip variant="blocked">BLOCKED</Chip>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="ag-section ag-border-section ag-how-it-works">
          <div className="ag-container">
            <div className="mx-auto max-w-2xl text-center">
              <p className="ag-eyebrow justify-center">How it works</p>
              <h2 className="ag-section-title">Every order passes through a safety gate.</h2>
              <p className="mt-4 text-pretty text-base leading-7 text-[var(--ag-muted)]">AgentGuard intercepts each trade intent, evaluates it against your policy config, and returns a deterministic decision before execution ever happens.</p>
            </div>
            <ol className="ag-pipeline mt-12" aria-label="AgentGuard trade checkpoint flow">
              {pipelineSteps.map(([icon, title, copy, state]) => (
                <li key={title} className="relative flex flex-col items-center text-center">
                  <span className={`ag-pipeline-node ag-pipeline-${state}`} aria-hidden="true">{icon}</span>
                  <strong className="text-xs font-semibold text-[var(--ag-text)]">{title}</strong>
                  <span className="ag-mono mt-1 max-w-28 text-[10px] leading-4 text-[var(--ag-muted)]">{copy}</span>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              <Chip variant="approved">APPROVED</Chip>
              <Chip variant="warning">RESIZED</Chip>
              <Chip variant="blocked">BLOCKED</Chip>
              <Chip variant="audit">AUDIT LOGGED</Chip>
            </div>
          </div>
        </section>

        <section id="policy" className="ag-section ag-border-section">
          <div className="ag-container">
            <p className="ag-eyebrow">Policy Engine</p>
            <h2 className="ag-section-title max-w-3xl">Risk rules your agent cannot talk its way around.</h2>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-[var(--ag-muted)]">Policies are deterministic. They do not reason, negotiate, or defer. When a rule fires, the outcome is fixed. No model can override it.</p>
            <div className="mt-10 grid gap-8 lg:grid-cols-[5fr_7fr]">
              <article className="ag-panel overflow-hidden">
                <PanelChrome title="policy.config.json" meta={<span className="ag-mono rounded border border-[var(--ag-border)] bg-[var(--ag-raised)] px-2 py-1 text-[9px] text-[var(--ag-muted)]">JSON</span>} />
                <pre className="overflow-x-auto bg-[var(--ag-deep)] p-5 text-xs leading-6 text-[var(--ag-text)]"><code>{`{
  "agent_id": "agent_07",
  "policies": {
    "maxPositionSize": { "limit": 20000, "action": "resize" },
    "maxLeverage": { "limit": 5, "action": "block" },
    "dailyLossLimit": { "limit": 40000, "action": "flatten_and_pause" },
    "volatilityGuard": { "enabled": true, "action": "reduce_size_50pct" },
    "killSwitch": { "enabled": false, "action": "flatten_all" }
  }
}`}</code></pre>
              </article>
              <div className="space-y-3">
                {policyCards.map(([title, copy, value, action, state]) => (
                  <article key={title} className="ag-panel p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-sm font-semibold text-[var(--ag-text)]">{title}</h3>
                      <Chip variant={state}>{action}</Chip>
                    </div>
                    <p className="mt-2 text-pretty text-sm leading-6 text-[var(--ag-muted)]">{copy}</p>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <span className="ag-mono text-2xl font-semibold text-[var(--ag-text)] tabular-nums">{value}</span>
                      <span className="ag-label text-right">→ {action === "standby" ? "flatten_all" : action === "resize" ? "downsize_and_log" : "flatten_and_pause"}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="replay" className="ag-section ag-border-section ag-live-console">
          <div className="ag-container">
            <p className="ag-eyebrow">Live Decision Console</p>
            <h2 className="ag-section-title max-w-3xl">See every decision before and after execution.</h2>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-[var(--ag-muted)]">Every trade evaluated by AgentGuard is written to the incident log. Inspect any decision, see which policy fired, and replay the full execution state.</p>
            <div className="ag-panel mt-9 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--ag-border-soft)] px-5 py-4">
                <div className="flex items-center gap-3"><strong className="ag-mono text-xs text-[var(--ag-text)]">AgentGuard / incident-log</strong><Chip variant="audit">live feed</Chip></div>
                <a className="ag-btn ag-btn-secondary" href="#demo">Export Log</a>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full border-collapse text-left">
                  <caption className="sr-only">Recent AgentGuard decisions</caption>
                  <thead className="bg-[rgba(18,24,32,.55)]">
                    <tr>{["Timestamp", "Agent", "Market", "Action", "Policy", "Decision", "Reason", "Replay"].map((head) => <th key={head} scope="col" className="ag-table-head">{head}</th>)}</tr>
                  </thead>
                  <tbody>
                    {incidentRows.map(([time, agent, market, action, policy, decision, reason, state]) => (
                      <tr key={time} className={`ag-incident-row ag-incident-${state}`}>
                        {[time, agent, market, action, policy].map((cell) => <td key={cell} className="ag-table-cell">{cell}</td>)}
                        <td className="ag-table-cell"><Chip variant={state}>{decision}</Chip></td>
                        <td className="ag-table-cell">{reason}</td>
                        <td className="ag-table-cell"><a className="text-[var(--ag-blue)] underline decoration-dotted underline-offset-4" href="#demo">↗ view</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section id="sdk" className="ag-section ag-border-section">
          <div className="ag-container grid gap-8 lg:grid-cols-[7fr_5fr]">
            <div>
              <p className="ag-eyebrow">Developer Integration</p>
              <h2 className="ag-section-title max-w-3xl">Wrap your execution call in five lines.</h2>
              <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-[var(--ag-muted)]">AgentGuard is an SDK wrapper around your existing Bitget execution call. Drop it into your agent pipeline in minutes. No strategy custody. No model access required.</p>
              <article className="ag-panel mt-8 overflow-hidden">
                <PanelChrome title="agent_trade.py" meta={<span className="ag-mono rounded border border-[var(--ag-border)] bg-[var(--ag-raised)] px-2 py-1 text-[9px] text-[var(--ag-muted)]">Python</span>} />
                <pre className="overflow-x-auto bg-[var(--ag-deep)] p-5 text-xs leading-6 text-[var(--ag-text)]"><code>{`from agentguard import Guard

guard = Guard(
    policy="./policy.config.json",
    agent_id="agent_07",
    client=bitget_client,
)

result = guard.submit({
    "symbol": "BTCUSDT-PERP",
    "side": "long",
    "size": 42000,
    "leverage": 8,
})`}</code></pre>
              </article>
            </div>
            <aside className="ag-panel self-end p-5" aria-label="Guard submit response">
              <div className="mb-4 flex items-center justify-between"><h3 className="ag-mono text-xs text-[var(--ag-text)]">response / guard.submit()</h3><Chip variant="warning">RESIZED</Chip></div>
              <dl className="space-y-3">
                {[["status", "resized", "text-[var(--ag-amber)]"], ["original_size", "42000", ""], ["approved_size", "18500", "text-[var(--ag-green)]"], ["reason", "max_position_size_exceeded", "text-[var(--ag-amber)]"], ["audit_id", "evt_9f3c2a7b1e4d", "text-[var(--ag-blue)]"]].map(([key, value, className]) => (
                  <div key={key} className="flex items-baseline gap-4 border-b border-[var(--ag-border-soft)] pb-3 last:border-b-0 last:pb-0">
                    <dt className="ag-mono min-w-28 text-xs text-[var(--ag-blue)]">{key}</dt>
                    <dd className={`ag-mono text-xs tabular-nums text-[var(--ag-text)] ${className}`}>{value}</dd>
                  </div>
                ))}
              </dl>
              <a className="ag-btn ag-btn-developer mt-5 w-full justify-center" href="#github">Read the SDK docs →</a>
            </aside>
          </div>
        </section>

        <section id="demo" className="ag-final ag-risk-boundary ag-border-section">
          <div className="ag-container text-center">
            <h2 className="ag-display mx-auto max-w-3xl text-balance text-5xl leading-tight text-[var(--ag-text)] sm:text-6xl">Give your trading agent a hard risk boundary.</h2>
            <p className="mx-auto mt-5 max-w-md text-pretty text-base leading-7 text-[var(--ag-muted)]">Autonomous agents should move fast. They should not execute without limits.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a className="ag-btn ag-btn-primary ag-btn-lg" href="#demo">Run Demo →</a>
              <a className="ag-btn ag-btn-developer ag-btn-lg" href="#github">View GitHub</a>
            </div>
            <p className="ag-mono mx-auto mt-8 max-w-2xl text-[10px] uppercase text-[var(--ag-muted)]">Agent → AgentGuard checkpoint → Bitget execution API</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--ag-border-soft)] bg-[var(--ag-deep)] py-8">
        <div className="ag-container flex flex-col justify-between gap-5 text-[10px] text-[var(--ag-muted)] sm:flex-row sm:items-center">
          <p className="ag-mono">OPEN-SOURCE RISK FIREWALL SDK · AgentGuard enforces risk boundaries before execution.</p>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-5">
            <a href="#github" className="ag-footer-link">GitHub</a>
            <a href="#sdk" className="ag-footer-link">SDK</a>
            <a href="#policy" className="ag-footer-link">Policy Engine</a>
            <a href="#replay" className="ag-footer-link">Replay Logs</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
