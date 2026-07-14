"use client";

import { useFormState, useFormStatus } from "react-dom";
import { markInProgress, submitWork, type TaskFormState } from "@/app/actions/tasks";
import StatusBadge from "@/components/StatusBadge";
import ChannelIcon from "@/components/channels/ChannelIcon";
import {
  CONTENT_TYPE_LABELS,
  type ContentStatusName,
  type ContentTypeName,
} from "@/lib/content";

export type TaskPiece = {
  id: string;
  title: string;
  contentType: ContentTypeName;
  caption: string;
  brief: string;
  scheduledLabel: string;
  referenceLink: string | null;
  creativeLink: string | null;
  status: ContentStatusName;
  channels: { id: string; name: string; icon: string }[];
  rejectionComment: string | null;
};

const field =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function SubmitForm({
  piece,
  label,
}: {
  piece: TaskPiece;
  label: string;
}) {
  const [state, formAction] = useFormState<TaskFormState, FormData>(
    submitWork,
    undefined,
  );
  return (
    <form action={formAction} className="mt-4 space-y-3 border-t border-line pt-4">
      <input type="hidden" name="id" value={piece.id} />
      <div>
        <label
          htmlFor={`creativeLink-${piece.id}`}
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          Creative link
        </label>
        <input
          id={`creativeLink-${piece.id}`}
          name="creativeLink"
          type="url"
          required
          defaultValue={piece.creativeLink ?? ""}
          placeholder="https://… link to your finished asset"
          className={field}
        />
      </div>
      {state?.error && (
        <p
          role="alert"
          className="rounded-lg bg-brand-accent/10 px-3 py-2 text-sm text-brand-accent-dark"
        >
          {state.error}
        </p>
      )}
      <SubmitButton label={label} pendingLabel="Submitting…" />
    </form>
  );
}

export default function TaskCard({ piece }: { piece: TaskPiece }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-ink">{piece.title}</h4>
          <p className="mt-0.5 text-xs text-ink-muted">
            {CONTENT_TYPE_LABELS[piece.contentType]} · scheduled{" "}
            {piece.scheduledLabel}
          </p>
          {piece.channels.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {piece.channels.map((c) => (
                <ChannelIcon
                  key={c.id}
                  icon={c.icon}
                  name={c.name}
                  size={15}
                />
              ))}
            </div>
          )}
        </div>
        <StatusBadge status={piece.status} />
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Brief
          </p>
          <p className="mt-1 whitespace-pre-wrap text-ink">{piece.brief}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Caption
          </p>
          <p className="mt-1 whitespace-pre-wrap text-ink">{piece.caption}</p>
        </div>
        {piece.referenceLink && (
          <a
            href={piece.referenceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-primary underline"
          >
            Reference link ↗
          </a>
        )}
      </div>

      {/* Rejection feedback */}
      {piece.status === "NEEDS_REVISION" && piece.rejectionComment && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
            Revision requested
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-rose-800">
            {piece.rejectionComment}
          </p>
        </div>
      )}

      {/* Actions by status */}
      {piece.status === "ASSIGNED" && (
        <>
          <form action={markInProgress} className="mt-4">
            <input type="hidden" name="id" value={piece.id} />
            <button
              type="submit"
              className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-canvas"
            >
              Mark In Progress
            </button>
          </form>
          <SubmitForm piece={piece} label="Submit work" />
        </>
      )}

      {piece.status === "IN_PROGRESS" && (
        <SubmitForm piece={piece} label="Submit work" />
      )}

      {piece.status === "NEEDS_REVISION" && (
        <SubmitForm piece={piece} label="Resubmit work" />
      )}

      {(piece.status === "SUBMITTED" || piece.status === "APPROVED") &&
        piece.creativeLink && (
          <div className="mt-4 border-t border-line pt-4 text-sm">
            <a
              href={piece.creativeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-primary underline"
            >
              View submitted work ↗
            </a>
            <p className="mt-1 text-xs text-ink-muted">
              {piece.status === "SUBMITTED"
                ? "Awaiting review by the social media manager."
                : "Approved."}
            </p>
          </div>
        )}
    </div>
  );
}
