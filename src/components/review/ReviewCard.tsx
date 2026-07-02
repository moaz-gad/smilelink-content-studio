"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { approvePiece, rejectPiece, type ReviewFormState } from "@/app/actions/review";
import {
  CONTENT_TYPE_LABELS,
  FORMAT_LABELS,
  type ContentTypeName,
  type FormatName,
} from "@/lib/content";

export type ReviewPiece = {
  id: string;
  title: string;
  contentType: ContentTypeName;
  format: FormatName;
  assigneeName: string;
  scheduledLabel: string;
  creativeLink: string | null;
};

function ApproveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
    >
      {pending ? "Approving…" : "Approve"}
    </button>
  );
}

function ConfirmRejectButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
    >
      {pending ? "Rejecting…" : "Reject with comment"}
    </button>
  );
}

export default function ReviewCard({ piece }: { piece: ReviewPiece }) {
  const [rejecting, setRejecting] = useState(false);
  const [state, rejectAction] = useFormState<ReviewFormState, FormData>(
    rejectPiece,
    undefined,
  );

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-semibold text-ink">{piece.title}</h4>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-canvas px-2.5 py-1 font-medium text-ink-muted">
              {CONTENT_TYPE_LABELS[piece.contentType]}
            </span>
            <span className="rounded-full bg-canvas px-2.5 py-1 font-medium text-ink-muted">
              {FORMAT_LABELS[piece.format]}
            </span>
            <span className="text-ink-muted">
              {piece.assigneeName} · scheduled {piece.scheduledLabel}
            </span>
          </div>
        </div>

        {/* Prominent creative link */}
        {piece.creativeLink && (
          <a
            href={piece.creativeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-dark"
          >
            Open creative ↗
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="mt-5 border-t border-line pt-4">
        {!rejecting ? (
          <div className="flex items-center gap-3">
            <form action={approvePiece}>
              <input type="hidden" name="id" value={piece.id} />
              <ApproveButton />
            </form>
            <button
              onClick={() => setRejecting(true)}
              className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-canvas"
            >
              Reject
            </button>
          </div>
        ) : (
          <form action={rejectAction} className="space-y-3">
            <input type="hidden" name="id" value={piece.id} />
            <textarea
              name="comment"
              required
              autoFocus
              rows={3}
              placeholder="What needs fixing? (sent to the creator)"
              className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            />
            {state?.error && (
              <p role="alert" className="text-sm text-rose-700">
                {state.error}
              </p>
            )}
            <div className="flex items-center gap-2">
              <ConfirmRejectButton />
              <button
                type="button"
                onClick={() => setRejecting(false)}
                className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
