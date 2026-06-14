import { prisma } from "@/lib/db";

export default async function LoginPage() {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">DocFlow</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pick a demo account to continue. No password needed — this is a
          mocked login for review purposes.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {users.map((user) => (
            <form key={user.id} action="/api/auth/login" method="post">
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left transition hover:border-gray-400 hover:bg-gray-50"
              >
                <span>
                  <span className="block font-medium">{user.name}</span>
                  <span className="block text-xs text-gray-500">{user.email}</span>
                </span>
                <span className="text-sm text-gray-400">Continue &rarr;</span>
              </button>
            </form>
          ))}
        </div>

        {users.length === 0 && (
          <p className="mt-4 text-sm text-red-500">
            No seeded users found. Run <code>npm run db:seed</code> first.
          </p>
        )}
      </div>
    </main>
  );
}
