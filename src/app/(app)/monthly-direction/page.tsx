import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import DirectionForm from "@/components/monthly-direction/DirectionForm";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default async function MonthlyDirectionPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  // Marketing manager (edit) and social media manager (read) may view this.
  const user = await requireRole("MARKETING_MANAGER", "SOCIAL_MEDIA_MANAGER");
  const isManager = user.role === "MARKETING_MANAGER";

  // The social media manager only ever reads the current month. The marketing
  // manager may browse/edit any month via ?month=.
  const now = currentMonth();
  const requested = searchParams.month;
  const month =
    isManager && requested && MONTH_RE.test(requested) ? requested : now;

  const record = await prisma.monthlyDirection.findUnique({
    where: { month },
    include: { createdBy: { select: { name: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Monthly Direction</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {isManager
              ? "Set the theme and guidance for the social media manager."
              : "The theme and guidance for this month from your marketing manager."}
          </p>
        </div>

        {/* Month browser — marketing manager only. */}
        {isManager && (
          <form method="get" className="flex items-end gap-2">
            <div>
              <label
                htmlFor="month"
                className="mb-1.5 block text-xs font-medium text-ink-muted"
              >
                Month
              </label>
              <input
                id="month"
                name="month"
                type="month"
                defaultValue={month}
                className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
            >
              Go
            </button>
          </form>
        )}
      </div>

      <div className="rounded-xl bg-brand-primary/5 px-4 py-2 text-sm font-medium text-brand-primary-dark">
        {formatMonth(month)}
        {month === now && " · current month"}
      </div>

      {isManager ? (
        <DirectionForm
          month={month}
          theme={record?.theme ?? ""}
          direction={record?.direction ?? ""}
          exists={!!record}
        />
      ) : record ? (
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h3 className="text-lg font-semibold text-ink">{record.theme}</h3>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink">
            {record.direction}
          </p>
          <p className="mt-6 border-t border-line pt-4 text-xs text-ink-muted">
            Set by {record.createdBy.name} · updated{" "}
            {record.updatedAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-line bg-surface text-sm text-ink-muted shadow-card">
          No direction has been set for this month yet.
        </div>
      )}
    </div>
  );
}
