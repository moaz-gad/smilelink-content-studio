import { requireUser } from "@/lib/auth-helpers";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

export default async function ChangePasswordPage() {
  // Any authenticated user may change their own password.
  await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Change password</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Update the password you use to sign in. You&apos;ll need your current
          password to confirm the change.
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
