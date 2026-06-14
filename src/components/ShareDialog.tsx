"use client";

import { useState } from "react";

type Share = { userId: string; name: string; email: string };

export default function ShareDialog({
  documentId,
  initialShares,
  onClose,
}: {
  documentId: string;
  initialShares: Share[];
  onClose: () => void;
}) {
  const [shares, setShares] = useState(initialShares);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to share");
      }
      setShares((prev) => [...prev, { userId: data.userId, name: data.name, email: data.email }]);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(userId: string) {
    setError(null);
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to revoke access");
      }
      setShares((prev) => prev.filter((s) => s.userId !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Share document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleAdd} className="mb-4 flex gap-2">
          <input
            type="email"
            required
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </form>

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            People with access
          </h3>
          {shares.length === 0 ? (
            <p className="text-sm text-gray-500">Only you have access to this document.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {shares.map((share) => (
                <li key={share.userId} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{share.name}</p>
                    <p className="text-xs text-gray-500">{share.email}</p>
                  </div>
                  <button
                    onClick={() => handleRevoke(share.userId)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
