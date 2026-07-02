"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { updateUser, type UserFormState } from "@/app/actions/users";
import { ROLES, ROLE_LABELS } from "@/lib/roles";

const field =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";
const label = "mb-1.5 block text-sm font-medium text-ink";

type Props = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  isSelf: boolean;
};

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

export default function EditUserForm({ user, isSelf }: Props) {
  const [state, formAction] = useFormState<UserFormState, FormData>(
    updateUser,
    undefined,
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-line bg-surface p-6 shadow-card"
    >
      <input type="hidden" name="id" value={user.id} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={user.name}
            className={field}
          />
        </div>
        <div>
          <label className={label}>Email</label>
          <input
            value={user.email}
            disabled
            className={`${field} cursor-not-allowed bg-canvas text-ink-muted`}
          />
          <p className="mt-1 text-xs text-ink-muted">Email cannot be changed.</p>
        </div>
        <div>
          <label htmlFor="role" className={label}>
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            defaultValue={user.role}
            className={field}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="isActive" className={label}>
            Status
          </label>
          <select
            id="isActive"
            name="isActive"
            defaultValue={user.isActive ? "true" : "false"}
            disabled={isSelf}
            className={`${field} ${isSelf ? "cursor-not-allowed bg-canvas text-ink-muted" : ""}`}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          {isSelf && (
            <p className="mt-1 text-xs text-ink-muted">
              You cannot deactivate your own account.
            </p>
          )}
        </div>
      </div>

      {/* Keep status submitted even when the field is disabled for self. */}
      {isSelf && <input type="hidden" name="isActive" value="true" />}

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
          href="/users"
          className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-canvas"
        >
          Back to users
        </Link>
      </div>
    </form>
  );
}
