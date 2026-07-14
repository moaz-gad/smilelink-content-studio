"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { changeOwnPassword, type PasswordFormState } from "@/app/actions/password";

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
      {pending ? "Saving…" : "Change password"}
    </button>
  );
}

export default function ChangePasswordForm() {
  const [state, formAction] = useFormState<PasswordFormState, FormData>(
    changeOwnPassword,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields after a successful change.
  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-card">
      <form
        ref={formRef}
        action={formAction}
        className="max-w-md space-y-4 px-6 py-5"
      >
        <div>
          <label htmlFor="currentPassword" className={label}>
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="newPassword" className={label}>
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className={label}>
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
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
        {state?.success && (
          <p className="rounded-lg bg-brand-primary/10 px-3 py-2 text-sm text-brand-primary-dark">
            {state.success}
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
