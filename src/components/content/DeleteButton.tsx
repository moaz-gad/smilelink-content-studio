"use client";

import { deleteContentPiece } from "@/app/actions/content";

export default function DeleteButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <form
      action={deleteContentPiece}
      onSubmit={(e) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
      >
        Delete
      </button>
    </form>
  );
}
