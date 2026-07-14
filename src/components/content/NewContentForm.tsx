"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  createContentPiece,
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
      {pending ? "Saving…" : "Create piece"}
    </button>
  );
}

export default function NewContentForm({
  channels,
}: {
  channels: ChannelOption[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState<ContentFormState, FormData>(
    createContentPiece,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-ink">New content piece</h3>
          <p className="text-sm text-ink-muted">
            Plan a piece for this month. It starts as Planned.
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
        >
          {open ? "Close" : "New piece"}
        </button>
      </div>

      {open && (
        <form
          ref={formRef}
          action={formAction}
          className="border-t border-line px-6 py-5"
        >
          <ContentFields channels={channels} />

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

          <div className="mt-5">
            <SubmitButton />
          </div>
        </form>
      )}
    </div>
  );
}
