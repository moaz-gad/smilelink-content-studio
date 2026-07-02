"use server";

import { revalidatePath } from "next/cache";
import type { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export type TaskFormState = { error?: string; success?: string } | undefined;

function validUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return trimmed;
  } catch {
    return null;
  }
}

// Statuses a creator may submit/resubmit from.
const SUBMITTABLE: ContentStatus[] = ["ASSIGNED", "IN_PROGRESS", "NEEDS_REVISION"];

// Move an assigned piece to IN_PROGRESS. Only the assigned creator may do this.
export async function markInProgress(formData: FormData): Promise<void> {
  const user = await requireRole("GRAPHIC_DESIGNER", "VIDEOGRAPHER");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const piece = await prisma.contentPiece.findUnique({ where: { id } });
  // Ownership + valid-transition guard.
  if (!piece || piece.assignedToId !== user.id || piece.status !== "ASSIGNED") {
    return;
  }

  await prisma.contentPiece.update({
    where: { id },
    data: { status: "IN_PROGRESS" },
  });
  revalidatePath("/my-tasks");
}

// Submit or resubmit finished work: save the creative link and move to SUBMITTED.
export async function submitWork(
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const user = await requireRole("GRAPHIC_DESIGNER", "VIDEOGRAPHER");

  const id = String(formData.get("id") ?? "");
  const creativeLink = validUrl(String(formData.get("creativeLink") ?? ""));
  if (!id) return { error: "Missing piece id." };
  if (!creativeLink) {
    return { error: "Enter a valid http(s) link to your finished work." };
  }

  const piece = await prisma.contentPiece.findUnique({ where: { id } });
  // Only the assigned creator, and only from a submittable status.
  if (!piece || piece.assignedToId !== user.id) {
    return { error: "You can only submit pieces assigned to you." };
  }
  if (!SUBMITTABLE.includes(piece.status)) {
    return { error: "This piece cannot be submitted in its current state." };
  }

  await prisma.contentPiece.update({
    where: { id },
    data: { creativeLink, status: "SUBMITTED" },
  });
  revalidatePath("/my-tasks");
  return { success: "Submitted for review." };
}
