import Image from "next/image";
import LoginForm from "@/components/LoginForm";

// Standalone login page at "/" — no sidebar, no app shell.
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md">
        {/* Logo + title */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/smilelink-logo.png"
            alt="Smile Link"
            width={160}
            height={145}
            priority
            className="h-24 w-auto object-contain"
          />
          <h1 className="mt-5 text-xl font-semibold text-ink">
            Social Media Management System
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-line bg-surface p-8 shadow-card">
          <h2 className="text-lg font-semibold text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Use the account provided by your marketing manager.
          </p>
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted">
          Smile Link Dental Laboratory · Internal use only
        </p>
      </div>
    </main>
  );
}
