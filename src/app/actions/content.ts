"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type ContentType, type Format } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import {
  isContentType,
  isFormat,
  FORMAT_TO_ROLE,
  type FormatName,
} from "@/lib/content";
import { currentMonth, parseDateInput } from "@/lib/dates";

export type ContentFormState = { error?: string; success?: string } | undefined;

// Optional URL field: allow empty, otherwise require a valid http(s) URL.
function normalizeUrl(raw: string): { ok: true; value: string | null } | { ok: false } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: null };
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") return { ok: false };
    return { ok: true, value: trimmed };
  } catch {
    return { ok: false };
  }
}

type ParsedFields = {
  title: string;
  contentType: ContentType;
  format: Format;
  caption: string;
  brief: string;
  referenceLink: string | null;
  scheduledDate: Date;
};

function parseFields(formData: FormData): ParsedFields | string {
  const title = String(formData.get("title") ?? "").trim();
  const contentType = String(formData.get("contentType") ?? "");
  const format = String(formData.get("format") ?? "");
  const caption = String(formData.get("caption") ?? "").trim();
  const brief = String(formData.get("brief") ?? "").trim();
  const scheduledDateRaw = String(formData.get("scheduledDate") ?? "");
  const referenceLinkRaw = String(formData.get("referenceLink") ?? "");

  if (!title || !caption || !brief) {
    return "Title, caption, and brief are required.";
  }
  if (!isContentType(contentType)) return "Select a valid content type.";
  if (!isFormat(format)) return "Select a valid format.";

  const scheduledDate = parseDateInput(scheduledDateRaw);
  if (!scheduledDate) return "Enter a valid scheduled date.";

  const ref = normalizeUrl(referenceLinkRaw);
  if (!ref.ok) return "Reference link must be a valid http(s) URL.";

  return {
    title,
    contentType: contentType as ContentType,
    format: format as Format,
    caption,
    brief,
    referenceLink: ref.value,
    scheduledDate,
  };
}

export async function createContentPiece(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const user = await requireRole("SOCIAL_MEDIA_MANAGER");

  const parsed = parseFields(formData);
  if (typeof parsed === "string") return { error: parsed };

  // Every piece hangs off the current month's direction.
  const month = currentMonth();
  const direction = await prisma.monthlyDirection.findUnique({
    where: { month },
  });
  if (!direction) {
    return {
      error: `No monthly direction exists for ${month}. Ask your marketing manager to set it before planning content.`,
    };
  }

  await prisma.contentPiece.create({
    data: {
      ...parsed,
      status: "PLANNED",
      monthlyDirectionId: direction.id,
      createdById: user.id,
    },
  });

  revalidatePath("/content");
  return { success: `"${parsed.title}" planned.` };
}

export async function updateContentPiece(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireRole("SOCIAL_MEDIA_MANAGER");

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing piece id." };

  const parsed = parseFields(formData);
  if (typeof parsed === "string") return { error: parsed };

  const existing = await prisma.contentPiece.findUnique({
    where: { id },
    include: { assignedTo: { select: { role: true } } },
  });
  if (!existing) return { error: "Content piece not found." };

  // If the format changes away from the assignee's role, the assignment is no
  // longer valid — clear it and send the piece back to PLANNED.
  const clearsAssignment =
    existing.assignedToId != null &&
    parsed.format !== existing.format &&
    existing.assignedTo?.role !== FORMAT_TO_ROLE[parsed.format as FormatName];

  await prisma.contentPiece.update({
    where: { id },
    data: {
      ...parsed,
      ...(clearsAssignment ? { assignedToId: null, status: "PLANNED" } : {}),
    },
  });

  revalidatePath("/content");
  return {
    success: clearsAssignment
      ? "Piece updated. The format changed, so the previous assignment was cleared."
      : "Piece updated.",
  };
}

export async function deleteContentPiece(formData: FormData): Promise<void> {
  await requireRole("SOCIAL_MEDIA_MANAGER");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  try {
    await prisma.contentPiece.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return; // already gone
    }
    throw e;
  }
  revalidatePath("/content");
}

export async function assignContentPiece(formData: FormData): Promise<void> {
  await requireRole("SOCIAL_MEDIA_MANAGER");

  const id = String(formData.get("id") ?? "");
  const assignedToId = String(formData.get("assignedToId") ?? "");
  if (!id || !assignedToId) return;

  const piece = await prisma.contentPiece.findUnique({ where: { id } });
  if (!piece) return;

  const assignee = await prisma.user.findUnique({ where: { id: assignedToId } });
  const requiredRole = FORMAT_TO_ROLE[piece.format as FormatName];

  // Server-side guard: the creator's role must match the piece's format, and
  // they must be active. This is the real enforcement — the dropdown filtering
  // is only convenience.
  if (!assignee || !assignee.isActive || assignee.role !== requiredRole) {
    return;
  }

  await prisma.contentPiece.update({
    where: { id },
    data: { assignedToId, status: "ASSIGNED" },
  });
  revalidatePath("/content");
}
