"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import {
  updateContentPiece,
  type ContentFormState,
} from "@/app/actions/content";
import ContentFields, { type ChannelOption } from "./ContentFields";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export default function EditContentForm({
  piece,
  channels,
}: {
  channels: ChannelOption[];
  piece: {
    id: string;
    title: string;
    contentType: string;
    format: string;
    caption: string;
    brief: string;
    referenceLink: string;
    scheduledDate: string;
    channelIds: string[];
  };
}) {
  const [state, formAction] = useFormState<ContentFormState, FormData>(
    updateContentPiece,
    undefined,
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-line bg-surface p-6 shadow-card"
    >
      <input type="hidden" name="id" value={piece.id} />
      <ContentFields defaults={piece} channels={channels} />

      {state?.error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-brand-accent/10 px-3 py-2 text-sm text-brand-accent-dark"
        >
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mt-4 rounded-lg bg-brand-primary/10 px-3 py-2 text-sm text-brand-primary-dark">
          {state.success}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <SubmitButton />
        <Link
          href="/content"
          className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-canvas"
        >
          Back to content
        </Link>
      </div>
    </form>
  );
}
