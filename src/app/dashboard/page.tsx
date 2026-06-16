import { readFile } from "fs/promises";
import { join } from "path";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgentGuard Dashboard | Demo",
  description: "Visual proof of AgentGuard risk decisions before Bitget-style execution.",
};

interface DashboardDataset {
  generatedAt: string;
  metrics: {
    ordersEvaluated: number;
    approved: number;
    resized: number;
    blocked: number;
    flattened: number;
    paused: number;
    marketRiskBlocks: number;
    forwardedToExecution: number;
    blockedBeforeExecution: number;
    approvalRatePct: number;
    currentRiskMode: "active" | "flat" | "paused" | "monitor";
    policyHealth: "healthy" | "warning" | "critical";
  };
  events: Array<{
    id: string;
    timestamp: string;
    symbol: string;
    action: string;
    reason: string;
    severity: "safe" | "warning" | "danger" | "neutral";
    notionalUsd: number;
    leverage: number;
    forwarded?: boolean;
    source?: string;
  }>;
  policy?: {
    mode: string;
    maxLeverage: number;
    maxOrderUsd: number;
    maxDailyDrawdownPct: number;
    allowedSymbols: string[];
    failClosed: boolean;
    actions: Record<string, string>;
    marketRisk?: {
      enabled: boolean;
      blockOnExtremeRegime?: boolean;
      blockOnExtremeSentiment?: boolean;
      maxFundingRateAbs?: number;
      maxVolatilityPct?: number;
      actionOnMarketRisk?: string;
    };
  };
}

async function loadDashboardData(): Promise<DashboardDataset> {
  const filePath = join(process.cwd(), "data", "agentguard-dashboard-sample.json");
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content) as DashboardDataset;
}

function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, string> = {
    safe: "bg-[rgba(74,222,128,.15)] text-[var(--ag-green)] border-[rgba(74,222,128,.3)]",
    warning: "bg-[rgba(251,191,36,.12)] text-[var(--ag-amber)] border-[rgba(251,191,36,.35)]",
    danger: "bg-[rgba(244,63,94,.12)] text-[var(--ag-red)] border-[rgba(244,63,94,.35)]",
    neutral: "bg-[rgba(138,148,166,.12)] text-[var(--ag-muted)] border-[rgba(138,148,166,.3)]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${variants[severity] || variants.neutral}`}>
      <span className="size-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      {severity}
    </span>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-[var(--ag-border-soft)] bg-[var(--ag-panel)] p-4">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ag-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--ag-text)] tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-[var(--ag-muted)]">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const data = await loadDashboardData();
  const { metrics, events, policy } = data;

  return (
    <div className="min-h-screen bg-[var(--ag-bg)] text-[var(--ag-text)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--ag-border-soft)] bg-[rgba(8,10,12,.88)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">AgentGuard Dashboard</h1>
            <span className="rounded-full border border-[var(--ag-border-soft)] bg-[var(--ag-raised)] px-2.5 py-0.5 text-[10px] font-medium uppercase text-[var(--ag-muted)]">
              Demo Mode
            </span>
          </div>
          <p className="hidden text-xs text-[var(--ag-muted)] sm:block">
            Visual proof of AgentGuard decisions before Bitget-style execution.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Metrics */}
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-medium text-[var(--ag-muted)]">Key Metrics</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <MetricCard label="Evaluated" value={metrics.ordersEvaluated} />
            <MetricCard label="Approved" value={metrics.approved} hint={`${metrics.approvalRatePct}% rate`} />
            <MetricCard label="Resized" value={metrics.resized} />
            <MetricCard label="Blocked" value={metrics.blocked} />
            <MetricCard label="Market Risk" value={metrics.marketRiskBlocks} />
            <MetricCard label="Forwarded" value={metrics.forwardedToExecution} />
            <MetricCard label="Risk Mode" value={metrics.currentRiskMode} />
            <MetricCard 
              label="Policy Health" 
              value={metrics.policyHealth}
              hint={metrics.policyHealth === "healthy" ? "All systems nominal" : metrics.policyHealth === "warning" ? "Review blocked orders" : "Immediate attention required"}
            />
          </div>
        </section>

        {/* Event Stream */}
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-medium text-[var(--ag-muted)]">Decision Log</h2>
          <div className="overflow-hidden rounded-lg border border-[var(--ag-border-soft)] bg-[var(--ag-panel)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--ag-border-soft)]">
                <thead className="bg-[var(--ag-raised)]">
                  <tr>
                    {["Time", "Symbol", "Action", "Reason", "Severity", "Notional", "Leverage", "Source"].map((col) => (
                      <th key={col} scope="col" className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-wide text-[var(--ag-muted)]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ag-border-soft)]">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-[var(--ag-raised)] transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 text-[10px] font-mono text-[var(--ag-muted)]">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-medium">{event.symbol}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`text-xs font-medium ${event.action === "approve" ? "text-[var(--ag-green)]" : event.action === "resize" ? "text-[var(--ag-amber)]" : "text-[var(--ag-red)]"}`}>
                          {event.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--ag-muted)]">{event.reason}</td>
                      <td className="px-4 py-3"><SeverityBadge severity={event.severity} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums">${event.notionalUsd.toLocaleString()}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums">{event.leverage}x</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--ag-muted)]">{event.source || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Policy Summary */}
        {policy && (
          <section className="mb-8">
            <h2 className="mb-4 text-sm font-medium text-[var(--ag-muted)]">Active Policy</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-[var(--ag-border-soft)] bg-[var(--ag-panel)] p-4">
                <p className="text-[10px] font-medium uppercase text-[var(--ag-muted)]">Max Leverage</p>
                <p className="mt-1 text-xl font-semibold">{policy.maxLeverage}x</p>
              </div>
              <div className="rounded-lg border border-[var(--ag-border-soft)] bg-[var(--ag-panel)] p-4">
                <p className="text-[10px] font-medium uppercase text-[var(--ag-muted)]">Max Order</p>
                <p className="mt-1 text-xl font-semibold">${policy.maxOrderUsd.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-[var(--ag-border-soft)] bg-[var(--ag-panel)] p-4">
                <p className="text-[10px] font-medium uppercase text-[var(--ag-muted)]">Daily Drawdown</p>
                <p className="mt-1 text-xl font-semibold">{policy.maxDailyDrawdownPct}%</p>
              </div>
              <div className="rounded-lg border border-[var(--ag-border-soft)] bg-[var(--ag-panel)] p-4">
                <p className="text-[10px] font-medium uppercase text-[var(--ag-muted)]">Allowed Symbols</p>
                <p className="mt-1 text-xs font-mono">{policy.allowedSymbols.join(", ")}</p>
              </div>
              {policy.marketRisk && (
                <>
                  <div className="rounded-lg border border-[var(--ag-border-soft)] bg-[var(--ag-panel)] p-4">
                    <p className="text-[10px] font-medium uppercase text-[var(--ag-muted)]">Market Risk</p>
                    <p className="mt-1 text-xl font-semibold">{policy.marketRisk.enabled ? "Enabled" : "Disabled"}</p>
                  </div>
                  {policy.marketRisk.maxVolatilityPct && (
                    <div className="rounded-lg border border-[var(--ag-border-soft)] bg-[var(--ag-panel)] p-4">
                      <p className="text-[10px] font-medium uppercase text-[var(--ag-muted)]">Max Volatility</p>
                      <p className="mt-1 text-xl font-semibold">{policy.marketRisk.maxVolatilityPct}%</p>
                    </div>
                  )}
                  {policy.marketRisk.maxFundingRateAbs && (
                    <div className="rounded-lg border border-[var(--ag-border-soft)] bg-[var(--ag-panel)] p-4">
                      <p className="text-[10px] font-medium uppercase text-[var(--ag-muted)]">Max Funding</p>
                      <p className="mt-1 text-xl font-semibold">+/-{policy.marketRisk.maxFundingRateAbs}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {/* Explanation */}
        <section>
          <h2 className="mb-4 text-sm font-medium text-[var(--ag-muted)]">What This Demo Proves</h2>
          <div className="rounded-lg border border-[var(--ag-border-soft)] bg-[var(--ag-panel)] p-5">
            <ul className="space-y-3 text-sm text-[var(--ag-muted)]">
              <li className="flex gap-2">
                <span className="text-[var(--ag-green)]">OK</span>
                AgentGuard evaluates order intent before execution, applying policy rules deterministically.
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--ag-green)]">OK</span>
                Approved and resized orders may reach the Bitget dry-run adapter; blocked orders never reach execution.
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--ag-green)]">OK</span>
                Market-risk sources (sentiment, volatility, funding) can affect decisions when enabled in policy.
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--ag-green)]">OK</span>
                This page uses sample data generated from npm run demo:dashboard-data.
              </li>
              <li className="flex gap-2">
                <span className="text-[var(--ag-amber)]">!</span>
                No real Bitget API calls, MCP tools, or live trades are executed in this demo.
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--ag-border-soft)] bg-[var(--ag-deep)] py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-[var(--ag-muted)] sm:px-6 lg:px-8">
          <p>AgentGuard Dashboard - Demo data generated at {new Date(data.generatedAt).toLocaleString()}</p>
        </div>
      </footer>
    </div>
  );
}
