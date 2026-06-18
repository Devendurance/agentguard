import { readFile } from "fs/promises";
import { join } from "path";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

interface PaperOrderRecord {
  generatedAt: string;
  mode: "paper";
  endpoint: string;
  safeOrder: {
    input: {
      symbol: string;
      side: string;
      orderType: string;
      notionalUsd: number;
      leverage: number;
    };
    decision: string;
    reason: string;
    forwardedToPaperClient: boolean;
    paperResult?: {
      status?: string;
      code?: string;
      msg?: string;
      orderId?: string;
      clientOid?: string;
    };
  };
  unsafeOrder: {
    input: {
      symbol: string;
      side: string;
      orderType: string;
      notionalUsd: number;
      leverage: number;
    };
    decision: string;
    reason: string;
    unsafeForwardedToPaperClient: false;
  };
  safetyNotes: string[];
}

async function loadDashboardData(): Promise<DashboardDataset> {
  const filePath = join(process.cwd(), "data", "agentguard-dashboard-sample.json");
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content) as DashboardDataset;
}

async function loadLegacyPaperOrderRecord(): Promise<PaperOrderRecord | null> {
  try {
    const filePath = join(process.cwd(), "data", "agentguard-paper-order-record.json");
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as PaperOrderRecord;
  } catch {
    return null;
  }
}

async function loadPaperOrderRecords(): Promise<PaperOrderRecord[]> {
  try {
    const filePath = join(process.cwd(), "data", "agentguard-paper-order-records.json");
    const content = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(content) as unknown;

    if (Array.isArray(parsed)) {
      return parsed as PaperOrderRecord[];
    }

    if (parsed && typeof parsed === "object" && Array.isArray((parsed as { records?: PaperOrderRecord[] }).records)) {
      return (parsed as { records: PaperOrderRecord[] }).records;
    }

    return [];
  } catch {
    const legacyRecord = await loadLegacyPaperOrderRecord();
    return legacyRecord ? [legacyRecord] : [];
  }
}

function getPaperRecordBadge(record: PaperOrderRecord): { label: string; className: string } {
  const code = record.safeOrder.paperResult?.code;

  if (!code) {
    return {
      label: "Safety gate / dry-run",
      className: "border-[rgba(251,191,36,.28)] bg-[rgba(251,191,36,.1)] text-[var(--ag-amber)]",
    };
  }

  if (code === "00000") {
    return {
      label: "Bitget paper success",
      className: "border-[rgba(74,222,128,.28)] bg-[rgba(74,222,128,.1)] text-[var(--ag-green)]",
    };
  }

  return {
    label: "Bitget paper rejected",
    className: "border-[rgba(244,63,94,.3)] bg-[rgba(244,63,94,.1)] text-[var(--ag-red)]",
  };
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
  const paperOrderRecords = await loadPaperOrderRecords();
  const { metrics, events, policy } = data;

  const sortedPaperOrderRecords = [...paperOrderRecords].sort((left, right) => {
    return new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime();
  });

  return (
    <div className="min-h-screen bg-[var(--ag-bg)] text-[var(--ag-text)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--ag-border-soft)] bg-[rgba(8,10,12,.88)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="text-lg font-semibold transition-colors hover:text-[var(--ag-green)]">
              AgentGuard Dashboard
            </Link>
            <span className="rounded-full border border-[var(--ag-border-soft)] bg-[var(--ag-raised)] px-2.5 py-0.5 text-[10px] font-medium uppercase text-[var(--ag-muted)]">
              Demo Mode
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-[var(--ag-border-soft)] bg-[var(--ag-raised)] px-3.5 py-1.5 text-xs font-medium text-[var(--ag-text)] transition-colors hover:border-[rgba(74,222,128,.35)] hover:text-[var(--ag-green)]"
            >
              Back to site
            </Link>
            <p className="hidden text-xs text-[var(--ag-muted)] sm:block">
              Visual proof of AgentGuard decisions before Bitget-style execution.
            </p>
          </div>
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

        {/* Verifiable Usage Record */}
        {sortedPaperOrderRecords.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-sm font-medium text-[var(--ag-muted)]">
              Verifiable Usage Records ({sortedPaperOrderRecords.length})
            </h2>
            <div className="rounded-lg border border-[var(--ag-border-soft)] bg-[var(--ag-panel)] p-5">
              <div className="space-y-4">
                {sortedPaperOrderRecords.map((paperOrderRecord) => {
                  const badge = getPaperRecordBadge(paperOrderRecord);

                  return (
                    <div key={paperOrderRecord.generatedAt} className="rounded-lg border border-[var(--ag-border-soft)] bg-[var(--ag-raised)] p-5">
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase ${badge.className}`}>
                          {badge.label}
                        </span>
                        <div className="grid gap-3 text-xs sm:grid-cols-3">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ag-muted)]">Generated</p>
                            <p className="mt-1 font-mono">{new Date(paperOrderRecord.generatedAt).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ag-muted)]">Mode</p>
                            <p className="mt-1 font-mono">{paperOrderRecord.mode}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ag-muted)]">Endpoint</p>
                            <p className="mt-1 font-mono">{paperOrderRecord.endpoint}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-lg border border-[rgba(74,222,128,.24)] bg-[rgba(74,222,128,.06)] p-4">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ag-green)]">Approved BTC Order</p>
                          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <dt className="text-[var(--ag-muted)]">Intent</dt>
                            <dd className="font-mono">{paperOrderRecord.safeOrder.input.symbol} {paperOrderRecord.safeOrder.input.side} {paperOrderRecord.safeOrder.input.orderType}</dd>
                            <dt className="text-[var(--ag-muted)]">Size</dt>
                            <dd className="font-mono">${paperOrderRecord.safeOrder.input.notionalUsd} at {paperOrderRecord.safeOrder.input.leverage}x</dd>
                            <dt className="text-[var(--ag-muted)]">Decision</dt>
                            <dd className="font-mono">{paperOrderRecord.safeOrder.decision}</dd>
                            <dt className="text-[var(--ag-muted)]">Reason</dt>
                            <dd className="font-mono">{paperOrderRecord.safeOrder.reason}</dd>
                            <dt className="text-[var(--ag-muted)]">Forwarded</dt>
                            <dd className="font-mono">{String(paperOrderRecord.safeOrder.forwardedToPaperClient)}</dd>
                            <dt className="text-[var(--ag-muted)]">Code</dt>
                            <dd className="font-mono">{paperOrderRecord.safeOrder.paperResult?.code || "-"}</dd>
                            <dt className="text-[var(--ag-muted)]">Message</dt>
                            <dd className="font-mono">{paperOrderRecord.safeOrder.paperResult?.msg || "-"}</dd>
                            <dt className="text-[var(--ag-muted)]">Order ID</dt>
                            <dd className="break-all font-mono">{paperOrderRecord.safeOrder.paperResult?.orderId || "-"}</dd>
                            <dt className="text-[var(--ag-muted)]">Client OID</dt>
                            <dd className="break-all font-mono">{paperOrderRecord.safeOrder.paperResult?.clientOid || "-"}</dd>
                          </dl>
                        </div>

                        <div className="rounded-lg border border-[rgba(244,63,94,.24)] bg-[rgba(244,63,94,.06)] p-4">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ag-red)]">Blocked ETH Order</p>
                          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <dt className="text-[var(--ag-muted)]">Intent</dt>
                            <dd className="font-mono">{paperOrderRecord.unsafeOrder.input.symbol} {paperOrderRecord.unsafeOrder.input.side} {paperOrderRecord.unsafeOrder.input.orderType}</dd>
                            <dt className="text-[var(--ag-muted)]">Size</dt>
                            <dd className="font-mono">${paperOrderRecord.unsafeOrder.input.notionalUsd} at {paperOrderRecord.unsafeOrder.input.leverage}x</dd>
                            <dt className="text-[var(--ag-muted)]">Decision</dt>
                            <dd className="font-mono">{paperOrderRecord.unsafeOrder.decision}</dd>
                            <dt className="text-[var(--ag-muted)]">Reason</dt>
                            <dd className="font-mono">{paperOrderRecord.unsafeOrder.reason}</dd>
                            <dt className="text-[var(--ag-muted)]">Forwarded</dt>
                            <dd className="font-mono">{String(paperOrderRecord.unsafeOrder.unsafeForwardedToPaperClient)}</dd>
                          </dl>
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg border border-[var(--ag-border-soft)] bg-[var(--ag-raised)] p-4">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ag-muted)]">Safety Notes</p>
                        <ul className="mt-2 space-y-2 text-xs text-[var(--ag-muted)]">
                          {paperOrderRecord.safetyNotes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

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
