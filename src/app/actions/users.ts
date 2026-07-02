"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { Prisma, type Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { isRoleName } from "@/lib/roles";

export type UserFormState = { error?: string; success?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createUser(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireRole("MARKETING_MANAGER");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!name || !email || !password || !role) {
    return { error: "All fields are required." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!isRoleName(role)) {
    return { error: "Select a valid role." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "A user with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, role: role as Role, isActive: true },
  });

  revalidatePath("/users");
  return { success: `User "${name}" created.` };
}

export async function updateUser(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const admin = await requireRole("MARKETING_MANAGER");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  const isActive = formData.get("isActive") === "true";

  if (!id || !name || !role) {
    return { error: "Name and role are required." };
  }
  if (!isRoleName(role)) {
    return { error: "Select a valid role." };
  }
  // Prevent an admin from locking themselves out.
  if (id === admin.id && !isActive) {
    return { error: "You cannot deactivate your own account." };
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { name, role: role as Role, isActive },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { error: "User not found." };
    }
    throw e;
  }

  revalidatePath("/users");
  return { success: "User updated." };
}

// Quick activate/deactivate toggle from the table. Deactivation is a soft
// disable — the account is kept, never hard-deleted.
export async function setUserActive(formData: FormData): Promise<void> {
  const admin = await requireRole("MARKETING_MANAGER");
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";

  if (!id) return;
  if (id === admin.id && !isActive) return; // never self-deactivate

  await prisma.user.update({ where: { id }, data: { isActive } });
  revalidatePath("/users");
}
