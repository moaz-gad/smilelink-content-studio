import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { toDateInputValue } from "@/lib/dates";
import EditContentForm from "@/components/content/EditContentForm";

export default async function EditContentPage({
  params,
}: {
  params: { id: string };
}) {
  await requireRole("SOCIAL_MEDIA_MANAGER");

  const piece = await prisma.contentPiece.findUnique({
    where: { id: params.id },
  });
  if (!piece) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Edit content piece</h2>
        <p className="mt-1 text-sm text-ink-muted">{piece.title}</p>
      </div>
      <EditContentForm
        piece={{
          id: piece.id,
          title: piece.title,
          contentType: piece.contentType,
          format: piece.format,
          caption: piece.caption,
          brief: piece.brief,
          referenceLink: piece.referenceLink ?? "",
          scheduledDate: toDateInputValue(piece.scheduledDate),
        }}
      />
    </div>
  );
}
