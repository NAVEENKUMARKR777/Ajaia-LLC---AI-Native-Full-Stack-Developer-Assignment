"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function UploadButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      const data = await res.json();
      router.push(`/documents/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100">
        {loading ? "Uploading..." : "Upload .txt / .md"}
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          className="hidden"
          onChange={handleChange}
          disabled={loading}
        />
      </label>
      {error && <span className="max-w-[14rem] text-right text-xs text-red-500">{error}</span>}
    </div>
  );
}
