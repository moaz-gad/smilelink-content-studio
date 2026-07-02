import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { currentMonth, formatMonthLabel } from "@/lib/dates";
import { STATUS_STYLES, type ContentStatusName } from "@/lib/content";

type Counts = Record<ContentStatusName, number>;

function emptyCounts(): Counts {
  return {
    PLANNED: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    SUBMITTED: 0,
    APPROVED: 0,
    NEEDS_REVISION: 0,
  };
}

async function countsForWhere(where: object): Promise<Counts> {
  const grouped = await prisma.contentPiece.groupBy({
    by: ["status"],
    where,
    _count: { _all: true },
  });
  const counts = emptyCounts();
  for (const g of grouped) {
    counts[g.status as ContentStatusName] = g._count._all;
  }
  return counts;
}

function StatCard({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status: ContentStatusName;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
      >
        {label}
      </span>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const month = currentMonth();
  const monthLabel = formatMonthLabel(month);

  // ---- Creator dashboard: their own tasks ----
  if (user.role === "GRAPHIC_DESIGNER" || user.role === "VIDEOGRAPHER") {
    const counts = await countsForWhere({ assignedToId: user.id });
    const active = counts.ASSIGNED + counts.IN_PROGRESS + counts.NEEDS_REVISION;
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-ink">
            Welcome, {user.name?.split(" ")[0]}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            You have {active} {active === 1 ? "task" : "tasks"} that need your
            attention.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Assigned" value={counts.ASSIGNED} status="ASSIGNED" />
          <StatCard label="In Progress" value={counts.IN_PROGRESS} status="IN_PROGRESS" />
          <StatCard label="Needs Revision" value={counts.NEEDS_REVISION} status="NEEDS_REVISION" />
          <StatCard label="Approved" value={counts.APPROVED} status="APPROVED" />
        </div>
        <Link
          href="/my-tasks"
          className="inline-flex rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-dark"
        >
          Go to My Tasks
        </Link>
      </div>
    );
  }

  // ---- Manager dashboard (SM manager + marketing manager): month overview ----
  const direction = await prisma.monthlyDirection.findUnique({
    where: { month },
  });
  const counts = direction
    ? await countsForWhere({ monthlyDirectionId: direction.id })
    : emptyCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const isSocial = user.role === "SOCIAL_MEDIA_MANAGER";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-ink">
          Welcome, {user.name?.split(" ")[0]}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          {monthLabel} · {total} {total === 1 ? "piece" : "pieces"} in the plan
          {direction ? ` · ${direction.theme}` : ""}
        </p>
      </div>

      {/* Primary live counts */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Planned" value={counts.PLANNED} status="PLANNED" />
        <StatCard label="Assigned" value={counts.ASSIGNED} status="ASSIGNED" />
        <StatCard label="Submitted" value={counts.SUBMITTED} status="SUBMITTED" />
        <StatCard label="Approved" value={counts.APPROVED} status="APPROVED" />
      </div>

      {/* Secondary counts */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface px-5 py-4 shadow-card">
          <p className="text-sm text-ink-muted">In Progress</p>
          <p className="mt-1 text-2xl font-semibold text-ink">
            {counts.IN_PROGRESS}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface px-5 py-4 shadow-card">
          <p className="text-sm text-ink-muted">Needs Revision</p>
          <p className="mt-1 text-2xl font-semibold text-ink">
            {counts.NEEDS_REVISION}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface px-5 py-4 shadow-card">
          <p className="text-sm text-ink-muted">Total</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{total}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isSocial ? (
          <>
            <Link
              href="/review-queue"
              className="flex items-center justify-between rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:border-brand-primary"
            >
              <div>
                <p className="font-semibold text-ink">Review Queue</p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  Approve or reject submitted work
                </p>
              </div>
              {counts.SUBMITTED > 0 && (
                <span className="rounded-full bg-brand-accent px-3 py-1 text-sm font-semibold text-white">
                  {counts.SUBMITTED}
                </span>
              )}
            </Link>
            <Link
              href="/content"
              className="flex items-center justify-between rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:border-brand-primary"
            >
              <div>
                <p className="font-semibold text-ink">Content Plan</p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  Create, assign, and edit pieces
                </p>
              </div>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/monthly-direction"
              className="rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:border-brand-primary"
            >
              <p className="font-semibold text-ink">Monthly Direction</p>
              <p className="mt-0.5 text-sm text-ink-muted">
                Set this month’s theme and guidance
              </p>
            </Link>
            <Link
              href="/reports"
              className="rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:border-brand-primary"
            >
              <p className="font-semibold text-ink">Reports</p>
              <p className="mt-0.5 text-sm text-ink-muted">
                Output and analytics for the month
              </p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
