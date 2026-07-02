"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";

export type DirectionFormState =
  | { error?: string; success?: string }
  | undefined;

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/; // YYYY-MM

// Create or update the single direction for a given month. Marketing manager
// only — enforced here so it holds regardless of what the UI renders.
export async function saveMonthlyDirection(
  _prev: DirectionFormState,
  formData: FormData,
): Promise<DirectionFormState> {
  const admin = await requireRole("MARKETING_MANAGER");

  const month = String(formData.get("month") ?? "").trim();
  const theme = String(formData.get("theme") ?? "").trim();
  const direction = String(formData.get("direction") ?? "").trim();

  if (!MONTH_RE.test(month)) {
    return { error: "Month must be in YYYY-MM format." };
  }
  if (!theme || !direction) {
    return { error: "Theme and direction are both required." };
  }

  await prisma.monthlyDirection.upsert({
    where: { month },
    update: { theme, direction },
    create: { month, theme, direction, createdById: admin.id },
  });

  revalidatePath("/monthly-direction");
  return { success: `Direction for ${month} saved.` };
}
