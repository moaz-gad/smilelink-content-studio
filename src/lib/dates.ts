// Date helpers. Scheduled dates are stored as `@db.Date`, which round-trips as
// a UTC-midnight Date — so we format/parse in UTC to avoid off-by-one-day drift.

export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Shift a "YYYY-MM" string by a number of months (negative = earlier).
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// "YYYY-MM-DD" -> Date at UTC midnight (for storing an @db.Date value).
export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Date -> "YYYY-MM-DD" (UTC) for prefilling a date input.
export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Date -> friendly label, formatted in UTC.
export function formatDateUTC(date: Date): string {
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// The month string ("YYYY-MM") a date belongs to, in UTC.
export function monthOf(date: Date): string {
  return date.toISOString().slice(0, 7);
}
