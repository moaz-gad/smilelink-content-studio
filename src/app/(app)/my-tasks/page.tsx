import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatDateUTC } from "@/lib/dates";
import {
  STATUS_LABELS,
  type ContentStatusName,
  type ContentTypeName,
} from "@/lib/content";
import TaskCard, { type TaskPiece } from "@/components/tasks/TaskCard";

// Display order for the status groups.
const GROUP_ORDER: ContentStatusName[] = [
  "ASSIGNED",
  "IN_PROGRESS",
  "NEEDS_REVISION",
  "SUBMITTED",
  "APPROVED",
];

export default async function MyTasksPage() {
  // Creators only — enforced server-side.
  const user = await requireRole("GRAPHIC_DESIGNER", "VIDEOGRAPHER");

  const pieces = await prisma.contentPiece.findMany({
    // Only pieces assigned to the logged-in creator.
    where: { assignedToId: user.id },
    orderBy: { scheduledDate: "asc" },
    select: {
      id: true,
      title: true,
      contentType: true,
      caption: true,
      brief: true,
      scheduledDate: true,
      referenceLink: true,
      creativeLink: true,
      status: true,
      // Latest rejection so we can show the revision comment.
      reviews: {
        where: { decision: "REJECTED" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { comment: true },
      },
    },
  });

  const tasks: TaskPiece[] = pieces.map((p) => ({
    id: p.id,
    title: p.title,
    contentType: p.contentType as ContentTypeName,
    caption: p.caption,
    brief: p.brief,
    scheduledLabel: formatDateUTC(p.scheduledDate),
    referenceLink: p.referenceLink,
    creativeLink: p.creativeLink,
    status: p.status as ContentStatusName,
    rejectionComment: p.reviews[0]?.comment ?? null,
  }));

  const groups = GROUP_ORDER.map((status) => ({
    status,
    items: tasks.filter((t) => t.status === status),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-ink">My Tasks</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {tasks.length === 0
            ? "You have no assigned pieces yet."
            : `${tasks.length} ${tasks.length === 1 ? "piece" : "pieces"} assigned to you.`}
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-line bg-surface text-sm text-ink-muted shadow-card">
          Nothing assigned to you right now.
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.status} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
                {STATUS_LABELS[group.status]}
              </h3>
              <span className="rounded-full bg-canvas px-2 py-0.5 text-xs font-medium text-ink-muted">
                {group.items.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {group.items.map((piece) => (
                <TaskCard key={piece.id} piece={piece} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
