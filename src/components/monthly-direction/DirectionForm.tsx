"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  saveMonthlyDirection,
  type DirectionFormState,
} from "@/app/actions/monthly-direction";

const field =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";
const label = "mb-1.5 block text-sm font-medium text-ink";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save direction"}
    </button>
  );
}

export default function DirectionForm({
  month,
  theme,
  direction,
  exists,
}: {
  month: string;
  theme: string;
  direction: string;
  exists: boolean;
}) {
  const [state, formAction] = useFormState<DirectionFormState, FormData>(
    saveMonthlyDirection,
    undefined,
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-line bg-surface p-6 shadow-card"
    >
      {/* Re-key the fields per month so switching months resets their values. */}
      <input type="hidden" name="month" value={month} />

      <div className="space-y-4">
        <div>
          <label htmlFor="theme" className={label}>
            Theme
          </label>
          <input
            key={`theme-${month}`}
            id="theme"
            name="theme"
            required
            defaultValue={theme}
            placeholder="e.g. Back-to-school smiles"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="direction" className={label}>
            Direction
          </label>
          <textarea
            key={`direction-${month}`}
            id="direction"
            name="direction"
            required
            rows={8}
            defaultValue={direction}
            placeholder="Focus, tone, and priorities for the month…"
            className={`${field} resize-y`}
          />
        </div>
      </div>

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

      <div className="mt-6">
        <SubmitButton />
        <span className="ml-3 text-xs text-ink-muted">
          {exists ? "Editing existing direction." : "Creating a new direction."}
        </span>
      </div>
    </form>
  );
}
