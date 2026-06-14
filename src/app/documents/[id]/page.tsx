import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canView, canManageSharing } from "@/lib/access";
import DocumentEditor from "@/components/DocumentEditor";

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return null; // middleware redirects to /login

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: { shares: { include: { user: true } }, owner: true },
  });

  if (!document) notFound();
  if (!canView(document, document.shares, user.id)) notFound();

  let initialContent;
  try {
    initialContent = JSON.parse(document.content);
  } catch {
    initialContent = { type: "doc", content: [{ type: "paragraph" }] };
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          &larr; Back to documents
        </Link>
      </div>
      <DocumentEditor
        documentId={document.id}
        initialTitle={document.title}
        initialContent={initialContent}
        ownerName={document.owner.name}
        isOwner={document.ownerId === user.id}
        canManageSharing={canManageSharing(document, user.id)}
        initialShares={document.shares.map((s) => ({
          userId: s.userId,
          name: s.user.name,
          email: s.user.email,
        }))}
      />
    </main>
  );
}
