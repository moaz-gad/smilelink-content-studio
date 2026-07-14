import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";
import { signOutAction } from "@/app/actions/auth";
import type { RoleName } from "@/lib/roles";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  // Roles that may see this item. Omitted = visible to everyone.
  roles?: RoleName[];
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <IconGrid /> },
  {
    label: "Calendar",
    href: "/calendar",
    icon: <IconCalendar />,
    roles: ["MARKETING_MANAGER", "SOCIAL_MEDIA_MANAGER"],
  },
  {
    label: "My Tasks",
    href: "/my-tasks",
    icon: <IconClipboard />,
    roles: ["GRAPHIC_DESIGNER", "VIDEOGRAPHER"],
  },
  {
    label: "Content",
    href: "/content",
    icon: <IconLayers />,
    roles: ["MARKETING_MANAGER", "SOCIAL_MEDIA_MANAGER"],
  },
  {
    label: "Review Queue",
    href: "/review-queue",
    icon: <IconCheck />,
    roles: ["SOCIAL_MEDIA_MANAGER"],
  },
  {
    label: "Monthly Direction",
    href: "/monthly-direction",
    icon: <IconCompass />,
    roles: ["MARKETING_MANAGER", "SOCIAL_MEDIA_MANAGER"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: <IconChart />,
    roles: ["MARKETING_MANAGER"],
  },
  {
    label: "Users",
    href: "/users",
    icon: <IconUsers />,
    roles: ["MARKETING_MANAGER"],
  },
];

function roleLabel(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Sidebar({ user }: { user: Session["user"] }) {
  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role as RoleName),
  );
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-line bg-brand-primary text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-card">
          <Image
            src="/smilelink-logo.png"
            alt="Smile Link"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Smile Link</p>
          <p className="text-xs text-white/70">Content Studio</p>
        </div>
      </div>

      {/* Nav — scrolls internally if it ever overflows, so the footer stays pinned */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="text-white/70">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer / signed-in account — pinned to the bottom, never scrolls away */}
      <div className="shrink-0 border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-accent text-sm font-semibold text-white">
            {initials(user.name ?? "SL")}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-white/70">
              {roleLabel(user.role)}
            </p>
          </div>
        </div>
        <Link
          href="/change-password"
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
        >
          <IconKey />
          Change password
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            <IconLogout />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

/* --- Inline icons (no external deps) --- */
function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}
function IconGrid() {
  return (
    <IconBase>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </IconBase>
  );
}
function IconCalendar() {
  return (
    <IconBase>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </IconBase>
  );
}
function IconLayers() {
  return (
    <IconBase>
      <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </IconBase>
  );
}
function IconCheck() {
  return (
    <IconBase>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </IconBase>
  );
}
function IconCompass() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="10" />
      <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </IconBase>
  );
}
function IconChart() {
  return (
    <IconBase>
      <path d="M3 3v18h18" />
      <path d="M18 17V9M13 17V5M8 17v-3" />
    </IconBase>
  );
}
function IconUsers() {
  return (
    <IconBase>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}
function IconClipboard() {
  return (
    <IconBase>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 12l2 2 4-4" />
    </IconBase>
  );
}
function IconKey() {
  return (
    <IconBase>
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m10.7 12.3 8.3-8.3M16 5l3 3M14 7l3 3" />
    </IconBase>
  );
}
function IconLogout() {
  return (
    <IconBase>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </IconBase>
  );
}
