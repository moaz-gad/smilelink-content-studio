import Link from "next/link";
import type { ContentType, Format, ContentStatus } from "@prisma/client";
import StatusBadge from "@/components/StatusBadge";
import DeleteButton from "./DeleteButton";
import { assignContentPiece } from "@/app/actions/content";
import {
  CONTENT_TYPE_LABELS,
  FORMAT_LABELS,
  FORMAT_TO_ROLE,
  type ContentStatusName,
  type ContentTypeName,
  type FormatName,
} from "@/lib/content";
import { formatDateUTC } from "@/lib/dates";

type Creator = { id: string; name: string; role: string };

type Piece = {
  id: string;
  title: string;
  contentType: ContentType;
  format: Format;
  status: ContentStatus;
  scheduledDate: Date;
  referenceLink: string | null;
  assignedTo: { id: string; name: string } | null;
};

// Assignment is offered while a piece is still being planned/assigned.
const ASSIGNABLE: ContentStatus[] = ["PLANNED", "ASSIGNED"];

export default function ContentTable({
  pieces,
  creators,
}: {
  pieces: Piece[];
  creators: Creator[];
}) {
  if (pieces.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-line bg-surface text-sm text-ink-muted shadow-card">
        No content planned for this month yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <th className="px-5 py-3">Title</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">Format</th>
            <th className="px-5 py-3">Scheduled</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Assignee</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pieces.map((p) => {
            const requiredRole = FORMAT_TO_ROLE[p.format as FormatName];
            const eligible = creators.filter((c) => c.role === requiredRole);
            const canAssign = ASSIGNABLE.includes(p.status);
            return (
              <tr key={p.id} className="border-b border-line align-top last:border-0">
                <td className="px-5 py-4 font-medium text-ink">
                  {p.title}
                  {p.referenceLink && (
                    <a
                      href={p.referenceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-xs font-normal text-brand-primary underline"
                    >
                      ref
                    </a>
                  )}
                </td>
                <td className="px-5 py-4 text-ink-muted">
                  {CONTENT_TYPE_LABELS[p.contentType as ContentTypeName]}
                </td>
                <td className="px-5 py-4 text-ink-muted">
                  {FORMAT_LABELS[p.format as FormatName]}
                </td>
                <td className="px-5 py-4 text-ink-muted">
                  {formatDateUTC(p.scheduledDate)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={p.status as ContentStatusName} />
                </td>
                <td className="px-5 py-4">
                  {p.assignedTo ? (
                    <span className="text-ink">{p.assignedTo.name}</span>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                  {canAssign && (
                    <form action={assignContentPiece} className="mt-2 flex gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <select
                        name="assignedToId"
                        required
                        defaultValue={p.assignedTo?.id ?? ""}
                        className="rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink outline-none focus:border-brand-primary"
                      >
                        <option value="" disabled>
                          {eligible.length
                            ? `Choose ${FORMAT_LABELS[p.format as FormatName].toLowerCase()} creator…`
                            : `No active ${FORMAT_LABELS[p.format as FormatName].toLowerCase()} creators`}
                        </option>
                        {eligible.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={eligible.length === 0}
                        className="rounded-lg bg-brand-primary px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-brand-primary-dark disabled:opacity-50"
                      >
                        {p.assignedTo ? "Reassign" : "Assign"}
                      </button>
                    </form>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/content/${p.id}/edit`}
                      className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-canvas"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={p.id} title={p.title} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
