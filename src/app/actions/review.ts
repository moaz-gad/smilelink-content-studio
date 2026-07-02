"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export type ReviewFormState = { error?: string } | undefined;

function revalidate() {
  revalidatePath("/review-queue");
  revalidatePath("/my-tasks");
  revalidatePath("/content");
  revalidatePath("/dashboard");
}

// Fast approve — one click, no dialog. Only valid on a SUBMITTED piece.
export async function approvePiece(formData: FormData): Promise<void> {
  const user = await requireRole("SOCIAL_MEDIA_MANAGER");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const piece = await prisma.contentPiece.findUnique({ where: { id } });
  if (!piece || piece.status !== "SUBMITTED") return;

  // Status change + audit log written together.
  await prisma.$transaction([
    prisma.contentPiece.update({ where: { id }, data: { status: "APPROVED" } }),
    prisma.reviewLog.create({
      data: {
        contentPieceId: id,
        reviewerId: user.id,
        decision: "APPROVED",
        comment: "",
      },
    }),
  ]);
  revalidate();
}

// Reject with a required comment — sends the piece back to the creator.
export async function rejectPiece(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await requireRole("SOCIAL_MEDIA_MANAGER");

  const id = String(formData.get("id") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();
  if (!id) return { error: "Missing piece id." };
  if (!comment) {
    return { error: "A comment is required so the creator knows what to fix." };
  }

  const piece = await prisma.contentPiece.findUnique({ where: { id } });
  if (!piece || piece.status !== "SUBMITTED") {
    return { error: "This piece is no longer awaiting review." };
  }

  await prisma.$transaction([
    prisma.contentPiece.update({
      where: { id },
      data: { status: "NEEDS_REVISION" },
    }),
    prisma.reviewLog.create({
      data: {
        contentPieceId: id,
        reviewerId: user.id,
        decision: "REJECTED",
        comment,
      },
    }),
  ]);
  revalidate();
  return undefined;
}
