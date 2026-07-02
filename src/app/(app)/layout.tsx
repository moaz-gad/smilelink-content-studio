import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth: the middleware already gates these routes, but we also
  // refuse to render the shell without a session so the sidebar never leaks.
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar user={session.user} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar — each page renders its own heading in the content area. */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-surface px-8">
          <span className="text-sm font-medium text-ink-muted">
            Smile Link · Content Studio
          </span>
          <span className="rounded-full bg-canvas px-3 py-1 text-xs font-medium text-ink-muted">
            July 2026
          </span>
        </header>
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
