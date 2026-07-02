import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import AddUserForm from "@/components/users/AddUserForm";
import UsersTable from "@/components/users/UsersTable";

export default async function UsersPage() {
  // Marketing manager only — enforced server-side.
  const admin = await requireRole("MARKETING_MANAGER");

  const users = await prisma.user.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Users</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Manage team accounts and roles. Deactivate accounts instead of
          deleting them.
        </p>
      </div>

      <AddUserForm />

      <UsersTable users={users} currentUserId={admin.id} />
    </div>
  );
}
