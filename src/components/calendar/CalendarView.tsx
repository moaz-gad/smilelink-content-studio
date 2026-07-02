"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import {
  CONTENT_TYPE_LABELS,
  FORMAT_LABELS,
  STATUS_STYLES,
  type ContentStatusName,
  type ContentTypeName,
  type FormatName,
} from "@/lib/content";

export type CalendarPiece = {
  id: string;
  title: string;
  contentType: ContentTypeName;
  format: FormatName;
  caption: string;
  status: ContentStatusName;
  assigneeName: string | null;
  creativeLink: string | null;
  dateISO: string; // YYYY-MM-DD
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarView({
  month,
  todayISO,
  pieces,
}: {
  month: string; // YYYY-MM
  todayISO: string;
  pieces: CalendarPiece[];
}) {
  const [selected, setSelected] = useState<CalendarPiece | null>(null);

  const [year, mon] = month.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, mon - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, mon, 0)).getUTCDate();

  // Group pieces by their day-of-month.
  const byDate = new Map<string, CalendarPiece[]>();
  for (const p of pieces) {
    const list = byDate.get(p.dateISO) ?? [];
    list.push(p);
    byDate.set(p.dateISO, list);
  }

  // Build cells: leading blanks to align the 1st, then each day.
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const dayKey = (d: number) =>
    `${month}-${String(d).padStart(2, "0")}`;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-line bg-canvas">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted"
            >
              {w}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            const key = day ? dayKey(day) : null;
            const dayPieces = key ? (byDate.get(key) ?? []) : [];
            const isToday = key === todayISO;
            return (
              <div
                key={idx}
                className={`min-h-[7rem] border-b border-r border-line p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0 ${
                  day ? "" : "bg-canvas/40"
                }`}
              >
                {day && (
                  <div className="flex h-full flex-col">
                    <span
                      className={`mb-1 inline-flex h-6 w-6 items-center justify-center self-start rounded-full text-xs font-medium ${
                        isToday
                          ? "bg-brand-primary text-white"
                          : "text-ink-muted"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="space-y-1">
                      {dayPieces.map((p) => (
                        <div
                          key={p.id}
                          className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium ${STATUS_STYLES[p.status]}`}
                        >
                          <button
                            onClick={() => setSelected(p)}
                            className="min-w-0 flex-1 truncate text-left"
                            title={p.title}
                          >
                            {p.title}
                          </button>
                          {p.status === "APPROVED" && p.creativeLink && (
                            <a
                              href={p.creativeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="Open creative link"
                              className="shrink-0 underline"
                            >
                              ↗
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-ink">
                {selected.title}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg px-2 py-1 text-sm text-ink-muted transition hover:bg-canvas"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <StatusBadge status={selected.status} />
              <span className="rounded-full bg-canvas px-2.5 py-1 font-medium text-ink-muted">
                {CONTENT_TYPE_LABELS[selected.contentType]}
              </span>
              <span className="rounded-full bg-canvas px-2.5 py-1 font-medium text-ink-muted">
                {FORMAT_LABELS[selected.format]}
              </span>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Assigned creator
                </dt>
                <dd className="mt-0.5 text-ink">
                  {selected.assigneeName ?? "Unassigned"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Caption
                </dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-ink">
                  {selected.caption}
                </dd>
              </div>
              {selected.status === "APPROVED" && selected.creativeLink && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Creative link
                  </dt>
                  <dd className="mt-0.5">
                    <a
                      href={selected.creativeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-brand-primary underline"
                    >
                      {selected.creativeLink}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
