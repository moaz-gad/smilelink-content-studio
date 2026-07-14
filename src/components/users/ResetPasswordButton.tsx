"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  resetUserPassword,
  type PasswordFormState,
} from "@/app/actions/password";

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
      {pending ? "Resetting…" : "Reset password"}
    </button>
  );
}

export default function ResetPasswordButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState<PasswordFormState, FormData>(
    resetUserPassword,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the inputs after a successful reset (keep the dialog open so the
  // admin sees the confirmation message).
  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-canvas"
      >
        Reset password
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-ink">
                  Reset password
                </h3>
                <p className="text-sm text-ink-muted">
                  Set a new password for {userName}.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg px-2 py-1 text-ink-muted transition hover:bg-canvas"
              >
                ✕
              </button>
            </div>

            <form ref={formRef} action={formAction} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={userId} />
              <div>
                <label htmlFor={`new-${userId}`} className={label}>
                  New password
                </label>
                <input
                  id={`new-${userId}`}
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
                <label htmlFor={`confirm-${userId}`} className={label}>
                  Confirm new password
                </label>
                <input
                  id={`confirm-${userId}`}
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

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-canvas"
                >
                  Close
                </button>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
