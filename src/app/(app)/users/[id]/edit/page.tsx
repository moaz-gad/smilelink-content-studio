import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import EditUserForm from "@/components/users/EditUserForm";

export default async function EditUserPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = await requireRole("MARKETING_MANAGER");

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Edit user</h2>
        <p className="mt-1 text-sm text-ink-muted">{user.email}</p>
      </div>
      <EditUserForm user={user} isSelf={user.id === admin.id} />
    </div>
  );
}
