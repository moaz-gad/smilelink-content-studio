// Client-safe content constants (no Prisma import). Server code validates
// submitted values against these before trusting them.

export const CONTENT_TYPES = [
  "REEL",
  "CAROUSEL",
  "SINGLE_POST",
  "STORY",
] as const;
export type ContentTypeName = (typeof CONTENT_TYPES)[number];

export const CONTENT_TYPE_LABELS: Record<ContentTypeName, string> = {
  REEL: "Reel",
  CAROUSEL: "Carousel",
  SINGLE_POST: "Single Post",
  STORY: "Story",
};

export const FORMATS = ["DESIGN", "VIDEO"] as const;
export type FormatName = (typeof FORMATS)[number];

export const FORMAT_LABELS: Record<FormatName, string> = {
  DESIGN: "Design",
  VIDEO: "Video",
};

// The role that may be assigned a piece of each format.
export const FORMAT_TO_ROLE: Record<FormatName, "GRAPHIC_DESIGNER" | "VIDEOGRAPHER"> = {
  DESIGN: "GRAPHIC_DESIGNER",
  VIDEO: "VIDEOGRAPHER",
};

export const CONTENT_STATUSES = [
  "PLANNED",
  "ASSIGNED",
  "IN_PROGRESS",
  "SUBMITTED",
  "APPROVED",
  "NEEDS_REVISION",
] as const;
export type ContentStatusName = (typeof CONTENT_STATUSES)[number];

export const STATUS_LABELS: Record<ContentStatusName, string> = {
  PLANNED: "Planned",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  NEEDS_REVISION: "Needs Revision",
};

// Badge colors — chosen to read at a glance.
export const STATUS_STYLES: Record<ContentStatusName, string> = {
  PLANNED: "bg-ink-muted/10 text-ink-muted",
  ASSIGNED: "bg-brand-primary/10 text-brand-primary-dark",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  SUBMITTED: "bg-brand-accent/15 text-brand-accent-dark",
  APPROVED: "bg-emerald-100 text-emerald-700",
  NEEDS_REVISION: "bg-rose-100 text-rose-700",
};

export function isContentType(v: unknown): v is ContentTypeName {
  return typeof v === "string" && (CONTENT_TYPES as readonly string[]).includes(v);
}
export function isFormat(v: unknown): v is FormatName {
  return typeof v === "string" && (FORMATS as readonly string[]).includes(v);
}
