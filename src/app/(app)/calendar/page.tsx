import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { currentMonth, formatMonthLabel, shiftMonth } from "@/lib/dates";
import {
  CONTENT_STATUSES,
  STATUS_LABELS,
  STATUS_STYLES,
  type ContentStatusName,
  type ContentTypeName,
  type FormatName,
} from "@/lib/content";
import CalendarView, {
  type CalendarPiece,
} from "@/components/calendar/CalendarView";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  // Social media manager and marketing manager only.
  await requireRole("SOCIAL_MEDIA_MANAGER", "MARKETING_MANAGER");

  const now = currentMonth();
  const month =
    searchParams.month && MONTH_RE.test(searchParams.month)
      ? searchParams.month
      : now;

  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));

  // All pieces scheduled in the displayed month, regardless of which monthly
  // direction they belong to.
  const pieces = await prisma.contentPiece.findMany({
    where: { scheduledDate: { gte: start, lt: end } },
    orderBy: { scheduledDate: "asc" },
    select: {
      id: true,
      title: true,
      contentType: true,
      format: true,
      caption: true,
      status: true,
      creativeLink: true,
      scheduledDate: true,
      assignedTo: { select: { name: true } },
    },
  });

  const items: CalendarPiece[] = pieces.map((p) => ({
    id: p.id,
    title: p.title,
    contentType: p.contentType as ContentTypeName,
    format: p.format as FormatName,
    caption: p.caption,
    status: p.status as ContentStatusName,
    assigneeName: p.assignedTo?.name ?? null,
    creativeLink: p.creativeLink,
    dateISO: p.scheduledDate.toISOString().slice(0, 10),
  }));

  const todayISO = new Date().toISOString().slice(0, 10);
  const prev = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Content Calendar</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {items.length} {items.length === 1 ? "piece" : "pieces"} scheduled
          </p>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <Link
            href={`/calendar?month=${prev}`}
            aria-label="Previous month"
            className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
          >
            ←
          </Link>
          <span className="min-w-[10rem] text-center text-sm font-semibold text-ink">
            {formatMonthLabel(month)}
          </span>
          <Link
            href={`/calendar?month=${next}`}
            aria-label="Next month"
            className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
          >
            →
          </Link>
          {month !== now && (
            <Link
              href="/calendar"
              className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-brand-primary transition hover:bg-canvas"
            >
              Today
            </Link>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {CONTENT_STATUSES.map((status) => (
          <span
            key={status}
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status as ContentStatusName]}`}
          >
            {STATUS_LABELS[status as ContentStatusName]}
          </span>
        ))}
      </div>

      <CalendarView month={month} todayISO={todayISO} pieces={items} />
    </div>
  );
}
