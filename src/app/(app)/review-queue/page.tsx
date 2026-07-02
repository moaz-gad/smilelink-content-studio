import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDateUTC } from "@/lib/dates";
import type { ContentTypeName, FormatName } from "@/lib/content";
import ReviewCard, { type ReviewPiece } from "@/components/review/ReviewCard";

export default async function ReviewQueuePage() {
  // Social media manager only — enforced server-side.
  await requireRole("SOCIAL_MEDIA_MANAGER");

  const pieces = await prisma.contentPiece.findMany({
    where: { status: "SUBMITTED" },
    orderBy: { scheduledDate: "asc" },
    select: {
      id: true,
      title: true,
      contentType: true,
      format: true,
      scheduledDate: true,
      creativeLink: true,
      assignedTo: { select: { name: true } },
    },
  });

  const items: ReviewPiece[] = pieces.map((p) => ({
    id: p.id,
    title: p.title,
    contentType: p.contentType as ContentTypeName,
    format: p.format as FormatName,
    assigneeName: p.assignedTo?.name ?? "Unassigned",
    scheduledLabel: formatDateUTC(p.scheduledDate),
    creativeLink: p.creativeLink,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Review Queue</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {items.length === 0
            ? "Nothing awaiting review."
            : `${items.length} ${items.length === 1 ? "piece" : "pieces"} awaiting review.`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-line bg-surface text-sm text-ink-muted shadow-card">
          You’re all caught up. 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((piece) => (
            <ReviewCard key={piece.id} piece={piece} />
          ))}
        </div>
      )}
    </div>
  );
}
