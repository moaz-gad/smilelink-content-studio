import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { currentMonth, formatMonthLabel, shiftMonth } from "@/lib/dates";
import Link from "next/link";
import {
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  FORMATS,
  FORMAT_LABELS,
} from "@/lib/content";
import { ROLE_LABELS, type RoleName } from "@/lib/roles";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function pct(n: number, d: number): number | null {
  if (d === 0) return null;
  return Math.round((n / d) * 100);
}
function fmtPct(v: number | null): string {
  return v === null ? "—" : `${v}%`;
}

// --- small presentational helpers (server components) ---

function StatCard({
  label,
  value,
  sub,
  accent = "text-ink",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <p className="text-sm font-medium text-ink-muted">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accent}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm text-ink">{label}</span>
      <div className="h-6 flex-1 overflow-hidden rounded-md bg-canvas">
        <div
          className={`h-full ${color}`}
          style={{ width: `${Math.max(width, value > 0 ? 4 : 0)}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-sm font-semibold text-ink">
        {value}
      </span>
    </div>
  );
}

const TYPE_COLORS = [
  "bg-brand-primary",
  "bg-brand-accent",
  "bg-brand-secondary",
  "bg-brand-primary-light",
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  // Marketing manager only — enforced server-side.
  await requireRole("MARKETING_MANAGER");

  const now = currentMonth();
  const month =
    searchParams.month && MONTH_RE.test(searchParams.month)
      ? searchParams.month
      : now;

  const direction = await prisma.monthlyDirection.findUnique({
    where: { month },
  });

  const pieces = direction
    ? await prisma.contentPiece.findMany({
        where: { monthlyDirectionId: direction.id },
        select: {
          id: true,
          contentType: true,
          format: true,
          status: true,
          scheduledDate: true,
          assignedTo: { select: { id: true, name: true, role: true } },
          reviews: { select: { decision: true, createdAt: true } },
        },
      })
    : [];

  // ---- Totals ----
  const totalPlanned = pieces.length;
  const approvedPieces = pieces.filter((p) => p.status === "APPROVED");
  const approvedCount = approvedPieces.length;

  // "Published" = approved AND the scheduled post date has arrived (no explicit
  // publish state exists in the model).
  const n = new Date();
  const todayUTC = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
  const publishedCount = approvedPieces.filter(
    (p) => p.scheduledDate.getTime() <= todayUTC,
  ).length;

  // ---- Breakdown by contentType / format ----
  const typeCounts = CONTENT_TYPES.map(
    (t) => pieces.filter((p) => p.contentType === t).length,
  );
  const formatCounts = FORMATS.map(
    (f) => pieces.filter((p) => p.format === f).length,
  );
  const typeMax = Math.max(1, ...typeCounts);
  const formatMax = Math.max(1, ...formatCounts);

  // ---- Approval rate & avg revisions (from ReviewLog) ----
  let approvals = 0;
  let rejections = 0;
  for (const p of pieces) {
    for (const r of p.reviews) {
      if (r.decision === "APPROVED") approvals++;
      else rejections++;
    }
  }
  const reviewedPieces = pieces.filter((p) => p.reviews.length > 0).length;
  const approvalRate = pct(approvals, approvals + rejections);
  const avgRevisions =
    reviewedPieces > 0 ? (rejections / reviewedPieces).toFixed(1) : "0.0";

  // ---- On-time rate: approved on or before scheduledDate ----
  let onTime = 0;
  for (const p of approvedPieces) {
    const approvedAt = p.reviews
      .filter((r) => r.decision === "APPROVED")
      .map((r) => r.createdAt.getTime())
      .sort((a, b) => b - a)[0];
    if (approvedAt === undefined) continue;
    // On time if approved during the scheduled day or earlier.
    const cutoff = p.scheduledDate.getTime() + 24 * 60 * 60 * 1000;
    if (approvedAt < cutoff) onTime++;
  }
  const onTimeRate = pct(onTime, approvedCount);

  // ---- Output per creator ----
  const creatorMap = new Map<
    string,
    { name: string; role: RoleName; assigned: number; completed: number }
  >();
  for (const p of pieces) {
    if (!p.assignedTo) continue;
    const c = p.assignedTo;
    const entry =
      creatorMap.get(c.id) ??
      { name: c.name, role: c.role as RoleName, assigned: 0, completed: 0 };
    entry.assigned++;
    if (p.status === "APPROVED") entry.completed++;
    creatorMap.set(c.id, entry);
  }
  const creators = [...creatorMap.values()].sort(
    (a, b) => b.completed - a.completed || b.assigned - a.assigned,
  );
  const creatorMax = Math.max(1, ...creators.map((c) => c.completed));

  const prev = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);

  return (
    <div className="space-y-8">
      {/* Header + month selector */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Reports</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {formatMonthLabel(month)}
            {direction ? ` · ${direction.theme}` : ""}
          </p>
        </div>
        <div className="flex items-end gap-2">
          <Link
            href={`/reports?month=${prev}`}
            aria-label="Previous month"
            className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
          >
            ←
          </Link>
          <form method="get" className="flex items-end gap-2">
            <input
              name="month"
              type="month"
              defaultValue={month}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
            <button
              type="submit"
              className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
            >
              Go
            </button>
          </form>
          <Link
            href={`/reports?month=${next}`}
            aria-label="Next month"
            className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
          >
            →
          </Link>
        </div>
      </div>

      {!direction ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-line bg-surface text-sm text-ink-muted shadow-card">
          No content plan exists for {formatMonthLabel(month)}.
        </div>
      ) : (
        <>
          {/* Totals */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Totals
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Planned" value={totalPlanned} sub="pieces in the plan" />
              <StatCard
                label="Approved"
                value={approvedCount}
                accent="text-emerald-600"
                sub="passed review"
              />
              <StatCard
                label="Published"
                value={publishedCount}
                accent="text-brand-primary"
                sub="approved & date reached"
              />
            </div>
          </section>

          {/* Rates */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Quality & timeliness
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Approval rate"
                value={fmtPct(approvalRate)}
                accent="text-brand-primary"
                sub={`${approvals} approved / ${approvals + rejections} decisions`}
              />
              <StatCard
                label="Avg revisions / piece"
                value={avgRevisions}
                accent="text-brand-accent-dark"
                sub={`across ${reviewedPieces} reviewed ${reviewedPieces === 1 ? "piece" : "pieces"}`}
              />
              <StatCard
                label="On-time rate"
                value={fmtPct(onTimeRate)}
                accent="text-brand-primary"
                sub={`${onTime} of ${approvedCount} approved on schedule`}
              />
            </div>
          </section>

          {/* Breakdowns */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <h3 className="text-base font-semibold text-ink">
                By content type
              </h3>
              <div className="mt-4 space-y-2.5">
                {CONTENT_TYPES.map((t, i) => (
                  <BarRow
                    key={t}
                    label={CONTENT_TYPE_LABELS[t]}
                    value={typeCounts[i]}
                    max={typeMax}
                    color={TYPE_COLORS[i % TYPE_COLORS.length]}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <h3 className="text-base font-semibold text-ink">By format</h3>
              <div className="mt-4 space-y-2.5">
                {FORMATS.map((f, i) => (
                  <BarRow
                    key={f}
                    label={FORMAT_LABELS[f]}
                    value={formatCounts[i]}
                    max={formatMax}
                    color={i === 0 ? "bg-brand-primary" : "bg-brand-accent"}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Output per creator */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Output per creator
            </h3>
            {creators.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-surface p-6 text-sm text-ink-muted shadow-card">
                No pieces have been assigned this month.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      <th className="px-5 py-3">Creator</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Completed</th>
                      <th className="px-5 py-3">Assigned</th>
                      <th className="px-5 py-3 w-1/3">Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creators.map((c) => (
                      <tr key={c.name} className="border-b border-line last:border-0">
                        <td className="px-5 py-3 font-medium text-ink">{c.name}</td>
                        <td className="px-5 py-3 text-ink-muted">
                          {ROLE_LABELS[c.role]}
                        </td>
                        <td className="px-5 py-3 font-semibold text-ink">
                          {c.completed}
                        </td>
                        <td className="px-5 py-3 text-ink-muted">{c.assigned}</td>
                        <td className="px-5 py-3">
                          <div className="h-4 w-full overflow-hidden rounded bg-canvas">
                            <div
                              className="h-full bg-brand-primary"
                              style={{
                                width: `${Math.round((c.completed / creatorMax) * 100)}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="text-xs text-ink-muted">
            Note: the workflow has no separate “published” state, so{" "}
            <span className="font-medium">Published</span> counts approved pieces
            whose scheduled date has arrived.
          </p>
        </>
      )}
    </div>
  );
}
