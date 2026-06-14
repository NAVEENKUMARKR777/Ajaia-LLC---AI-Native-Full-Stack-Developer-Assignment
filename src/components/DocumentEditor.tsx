"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useRef, useState } from "react";
import Toolbar from "./Toolbar";
import ShareDialog from "./ShareDialog";

type Share = { userId: string; name: string; email: string };
type SaveStatus = "saved" | "saving" | "error";

export default function DocumentEditor({
  documentId,
  initialTitle,
  initialContent,
  ownerName,
  isOwner,
  canManageSharing,
  initialShares,
}: {
  documentId: string;
  initialTitle: string;
  initialContent: object;
  ownerName: string;
  isOwner: boolean;
  canManageSharing: boolean;
  initialShares: Share[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [shareOpen, setShareOpen] = useState(false);
  const contentTimeout = useRef<ReturnType<typeof setTimeout>>();
  const titleTimeout = useRef<ReturnType<typeof setTimeout>>();

  const save = useCallback(
    async (data: { title?: string; content?: string }) => {
      setStatus("saving");
      try {
        const res = await fetch(`/api/documents/${documentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Save failed");
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    },
    [documentId]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Start writing..." }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setStatus("saving");
      if (contentTimeout.current) clearTimeout(contentTimeout.current);
      contentTimeout.current = setTimeout(() => {
        save({ content: JSON.stringify(editor.getJSON()) });
      }, 1000);
    },
  });

  useEffect(() => {
    return () => {
      if (contentTimeout.current) clearTimeout(contentTimeout.current);
      if (titleTimeout.current) clearTimeout(titleTimeout.current);
    };
  }, []);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setTitle(value);
    setStatus("saving");
    if (titleTimeout.current) clearTimeout(titleTimeout.current);
    titleTimeout.current = setTimeout(() => {
      if (value.trim()) save({ title: value.trim() });
    }, 800);
  }

  const statusLabel =
    status === "saving" ? "Saving..." : status === "error" ? "Error saving" : "Saved";
  const statusColor =
    status === "saving"
      ? "text-gray-400"
      : status === "error"
      ? "text-red-500"
      : "text-green-600";

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3">
        <input
          value={title}
          onChange={handleTitleChange}
          aria-label="Document title"
          className="w-full text-xl font-semibold outline-none"
          maxLength={200}
        />
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className={`text-xs ${statusColor}`}>{statusLabel}</span>
          {canManageSharing && (
            <button
              onClick={() => setShareOpen(true)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Share
            </button>
          )}
        </div>
      </div>

      {!isOwner && (
        <div className="border-b border-blue-100 bg-blue-50 px-4 py-2 text-xs text-blue-700">
          Shared by {ownerName} — you can view and edit this document.
        </div>
      )}

      <Toolbar editor={editor} />

      <div className="px-4 py-4">
        <EditorContent editor={editor} />
      </div>

      {shareOpen && (
        <ShareDialog
          documentId={documentId}
          initialShares={initialShares}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
