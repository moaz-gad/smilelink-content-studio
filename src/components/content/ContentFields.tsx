"use client";

import {
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  FORMATS,
  FORMAT_LABELS,
} from "@/lib/content";
import ChannelIcon from "@/components/channels/ChannelIcon";

export const field =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20";
export const label = "mb-1.5 block text-sm font-medium text-ink";

export type ChannelOption = { id: string; name: string; icon: string };

// Shared field set used by both the create and edit forms.
export default function ContentFields({
  defaults,
  channels = [],
}: {
  channels?: ChannelOption[];
  defaults?: {
    title?: string;
    contentType?: string;
    format?: string;
    caption?: string;
    brief?: string;
    referenceLink?: string;
    scheduledDate?: string;
    channelIds?: string[];
  };
}) {
  const d = defaults ?? {};
  const selectedChannels = new Set(d.channelIds ?? []);
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className={label}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={d.title}
          className={field}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="contentType" className={label}>
            Content type
          </label>
          <select
            id="contentType"
            name="contentType"
            required
            defaultValue={d.contentType ?? ""}
            className={field}
          >
            <option value="" disabled>
              Select…
            </option>
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {CONTENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="format" className={label}>
            Format
          </label>
          <select
            id="format"
            name="format"
            required
            defaultValue={d.format ?? ""}
            className={field}
          >
            <option value="" disabled>
              Select…
            </option>
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABELS[f]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="scheduledDate" className={label}>
            Scheduled date
          </label>
          <input
            id="scheduledDate"
            name="scheduledDate"
            type="date"
            required
            defaultValue={d.scheduledDate}
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="caption" className={label}>
          Caption
        </label>
        <textarea
          id="caption"
          name="caption"
          required
          rows={3}
          defaultValue={d.caption}
          className={`${field} resize-y`}
        />
      </div>

      <div>
        <label htmlFor="brief" className={label}>
          Brief
        </label>
        <textarea
          id="brief"
          name="brief"
          required
          rows={5}
          defaultValue={d.brief}
          placeholder="Direction of creation for the creator…"
          className={`${field} resize-y`}
        />
      </div>

      <div>
        <label htmlFor="referenceLink" className={label}>
          Reference link{" "}
          <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <input
          id="referenceLink"
          name="referenceLink"
          type="url"
          inputMode="url"
          defaultValue={d.referenceLink}
          placeholder="https://…  inspiration / reference for the creator"
          className={field}
        />
      </div>

      <div>
        <span className={label}>
          Channels{" "}
          <span className="font-normal text-ink-muted">
            (select all that apply)
          </span>
        </span>
        {channels.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No channels available. Ask an admin to seed them.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {channels.map((c) => (
              <label
                key={c.id}
                className="relative cursor-pointer select-none"
                title={c.name}
              >
                <input
                  type="checkbox"
                  name="channels"
                  value={c.id}
                  defaultChecked={selectedChannels.has(c.id)}
                  className="peer sr-only"
                />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-canvas peer-checked:border-brand-primary peer-checked:bg-brand-primary/10 peer-checked:text-brand-primary-dark peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary/20">
                  <ChannelIcon icon={c.icon} name={c.name} size={16} />
                  {c.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
