import Link from "next/link";
import type { Role } from "@prisma/client";
import { ROLE_LABELS } from "@/lib/roles";
import { setUserActive } from "@/app/actions/users";

type Row = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
};

export default function UsersTable({
  users,
  currentUserId,
}: {
  users: Row[];
  currentUserId: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="px-6 py-4 font-medium text-ink">
                  {u.name}
                  {isSelf && (
                    <span className="ml-2 text-xs font-normal text-ink-muted">
                      (you)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-ink-muted">{u.email}</td>
                <td className="px-6 py-4 text-ink">{ROLE_LABELS[u.role]}</td>
                <td className="px-6 py-4">
                  {u.isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-2.5 py-1 text-xs font-medium text-brand-primary-dark">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-muted/10 px-2.5 py-1 text-xs font-medium text-ink-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-ink-muted" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/users/${u.id}/edit`}
                      className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-canvas"
                    >
                      Edit
                    </Link>
                    <form action={setUserActive}>
                      <input type="hidden" name="id" value={u.id} />
                      <input
                        type="hidden"
                        name="isActive"
                        value={u.isActive ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        disabled={isSelf && u.isActive}
                        title={
                          isSelf && u.isActive
                            ? "You cannot deactivate your own account"
                            : undefined
                        }
                        className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
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
