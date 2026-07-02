import "server-only";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/auth";

// Require any authenticated user. Used by pages/actions; redirects to login
// when there is no session.
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/");
  return session.user;
}

// Require one of the given roles. Signed-out users go to login; signed-in users
// without the role are bounced to the dashboard. Enforced server-side so it
// protects both page renders and server actions.
export async function requireRole(...roles: Role[]) {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (!roles.includes(session.user.role)) redirect("/dashboard");
  return session.user;
}
