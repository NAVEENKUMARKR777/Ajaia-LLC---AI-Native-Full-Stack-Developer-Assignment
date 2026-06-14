"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewDocumentButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled document" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create document");
      }
      const data = await res.json();
      router.push(`/documents/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "New document"}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
