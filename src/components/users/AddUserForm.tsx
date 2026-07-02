"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createUser, type UserFormState } from "@/app/actions/users";
import { ROLES, ROLE_LABELS } from "@/lib/roles";

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
      {pending ? "Creating…" : "Create user"}
    </button>
  );
}

export default function AddUserForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState<UserFormState, FormData>(
    createUser,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields after a successful create.
  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state?.success]);

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-ink">Add user</h3>
          <p className="text-sm text-ink-muted">
            Create an account for a team member.
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
        >
          {open ? "Close" : "New user"}
        </button>
      </div>

      {open && (
        <form
          ref={formRef}
          action={formAction}
          className="border-t border-line px-6 py-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={label}>
                Name
              </label>
              <input id="name" name="name" required className={field} />
            </div>
            <div>
              <label htmlFor="email" className={label}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={field}
              />
            </div>
            <div>
              <label htmlFor="password" className={label}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className={field}
              />
            </div>
            <div>
              <label htmlFor="role" className={label}>
                Role
              </label>
              <select id="role" name="role" required defaultValue="" className={field}>
                <option value="" disabled>
                  Select a role…
                </option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
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

          <div className="mt-5">
            <SubmitButton />
          </div>
        </form>
      )}
    </div>
  );
}
