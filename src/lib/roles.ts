// Plain role constants safe to import into client components (no Prisma import,
// so the Prisma client never leaks into the browser bundle). Server code
// validates against these before trusting any submitted role.
export const ROLES = [
  "MARKETING_MANAGER",
  "SOCIAL_MEDIA_MANAGER",
  "GRAPHIC_DESIGNER",
  "VIDEOGRAPHER",
] as const;

export type RoleName = (typeof ROLES)[number];

export const ROLE_LABELS: Record<RoleName, string> = {
  MARKETING_MANAGER: "Marketing Manager",
  SOCIAL_MEDIA_MANAGER: "Social Media Manager",
  GRAPHIC_DESIGNER: "Graphic Designer",
  VIDEOGRAPHER: "Videographer",
};

export function isRoleName(value: unknown): value is RoleName {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
