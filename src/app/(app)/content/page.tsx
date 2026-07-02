import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { currentMonth, formatMonthLabel } from "@/lib/dates";
import {
  CONTENT_STATUSES,
  STATUS_LABELS,
  STATUS_STYLES,
  type ContentStatusName,
} from "@/lib/content";
import NewContentForm from "@/components/content/NewContentForm";
import ContentTable from "@/components/content/ContentTable";

export default async function ContentPage() {
  // Social media manager only — enforced server-side.
  await requireRole("SOCIAL_MEDIA_MANAGER");

  const month = currentMonth();
  const direction = await prisma.monthlyDirection.findUnique({
    where: { month },
  });

  // Active creators for the assignee dropdowns.
  const creators = await prisma.user.findMany({
    where: {
      isActive: true,
      role: { in: ["GRAPHIC_DESIGNER", "VIDEOGRAPHER"] },
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true },
  });

  const pieces = direction
    ? await prisma.contentPiece.findMany({
        where: { monthlyDirectionId: direction.id },
        orderBy: { scheduledDate: "asc" },
        select: {
          id: true,
          title: true,
          contentType: true,
          format: true,
          status: true,
          scheduledDate: true,
          referenceLink: true,
          assignedTo: { select: { id: true, name: true } },
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Content Plan</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {formatMonthLabel(month)} · {pieces.length}{" "}
          {pieces.length === 1 ? "piece" : "pieces"}
        </p>
      </div>

      {direction ? (
        <>
          <div className="rounded-xl bg-brand-primary/5 px-4 py-3 text-sm text-brand-primary-dark">
            <span className="font-semibold">This month’s direction:</span>{" "}
            {direction.theme}
          </div>

          {/* Quick-scan status summary */}
          {pieces.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {CONTENT_STATUSES.map((status) => {
                const n = pieces.filter((p) => p.status === status).length;
                if (n === 0) return null;
                return (
                  <span
                    key={status}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status as ContentStatusName]}`}
                  >
                    {STATUS_LABELS[status as ContentStatusName]}
                    <span className="font-semibold">{n}</span>
                  </span>
                );
              })}
            </div>
          )}

          <NewContentForm />
          <ContentTable pieces={pieces} creators={creators} />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-6 text-sm text-ink-muted shadow-card">
          No monthly direction has been set for {formatMonthLabel(month)} yet.
          Content is planned against the monthly direction, so ask your marketing
          manager to set it first (
          <Link href="/monthly-direction" className="text-brand-primary underline">
            Monthly Direction
          </Link>
          ).
        </div>
      )}
    </div>
  );
}
