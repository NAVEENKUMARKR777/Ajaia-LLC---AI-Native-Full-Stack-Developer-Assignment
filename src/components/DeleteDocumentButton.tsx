"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this document? This cannot be undone.")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded px-2 py-1 text-xs text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      title="Delete document"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}
