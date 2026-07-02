export default function Placeholder({
  title,
  step,
}: {
  title: string;
  step: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">
          This section is coming in {step}.
        </p>
      </div>
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-line bg-surface text-sm text-ink-muted shadow-card">
        {title} placeholder
      </div>
    </div>
  );
}
