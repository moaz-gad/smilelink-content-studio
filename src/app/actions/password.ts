"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/auth-helpers";

export type PasswordFormState = { error?: string; success?: string } | undefined;

// Self-service: any signed-in user changes their OWN password. The current
// password is verified before the new one is stored. The user id comes from the
// session (never from the form), so a user can only ever change their own.
export async function changeOwnPassword(
  _prev: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const sessionUser = await requireUser();

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!current || !next || !confirm) {
    return { error: "All fields are required." };
  }
  if (next.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  if (next !== confirm) {
    return { error: "New password and confirmation do not match." };
  }

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) {
    return { error: "User not found." };
  }

  const currentMatches = await bcrypt.compare(current, user.passwordHash);
  if (!currentMatches) {
    return { error: "Your current password is incorrect." };
  }
  if (current === next) {
    return { error: "New password must be different from your current password." };
  }

  const passwordHash = await bcrypt.hash(next, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: "Your password has been changed." };
}

// Admin reset: the marketing manager sets a new password for ANY user without
// needing the old one. Role is enforced server-side so a normal user cannot
// call this even if they hit the action directly.
export async function resetUserPassword(
  _prev: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  await requireRole("MARKETING_MANAGER");

  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!id) {
    return { error: "Missing user." };
  }
  if (!next || !confirm) {
    return { error: "Enter and confirm the new password." };
  }
  if (next.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (next !== confirm) {
    return { error: "Password and confirmation do not match." };
  }

  const passwordHash = await bcrypt.hash(next, 10);
  try {
    await prisma.user.update({ where: { id }, data: { passwordHash } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { error: "User not found." };
    }
    throw e;
  }

  revalidatePath("/users");
  return { success: "Password reset." };
}
