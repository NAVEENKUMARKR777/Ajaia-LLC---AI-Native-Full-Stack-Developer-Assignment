import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import NewDocumentButton from "@/components/NewDocumentButton";
import UploadButton from "@/components/UploadButton";
import DeleteDocumentButton from "@/components/DeleteDocumentButton";

function formatDate(date: Date) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null; // middleware redirects to /login

  const [owned, sharedWithMe] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.document.findMany({
      where: { shares: { some: { userId: user.id } } },
      include: { owner: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">DocFlow</h1>
          <p className="text-sm text-gray-500">
            Signed in as <span className="font-medium">{user.name}</span> ({user.email})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UploadButton />
          <NewDocumentButton />
          <form action="/api/auth/logout" method="post">
            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
              Switch user
            </button>
          </form>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          My Documents
        </h2>
        {owned.length === 0 ? (
          <p className="text-sm text-gray-500">
            You don&apos;t have any documents yet. Create one to get started.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {owned.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between px-4 py-3">
                <Link href={`/documents/${doc.id}`} className="flex-1 hover:underline">
                  <span className="block font-medium">{doc.title}</span>
                  <span className="block text-xs text-gray-500">
                    Updated {formatDate(doc.updatedAt)}
                  </span>
                </Link>
                <span className="ml-3 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  Owner
                </span>
                <DeleteDocumentButton documentId={doc.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Shared with Me
        </h2>
        {sharedWithMe.length === 0 ? (
          <p className="text-sm text-gray-500">No documents have been shared with you yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {sharedWithMe.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between px-4 py-3">
                <Link href={`/documents/${doc.id}`} className="flex-1 hover:underline">
                  <span className="block font-medium">{doc.title}</span>
                  <span className="block text-xs text-gray-500">
                    Shared by {doc.owner.name} &middot; Updated {formatDate(doc.updatedAt)}
                  </span>
                </Link>
                <span className="ml-3 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                  Shared
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
