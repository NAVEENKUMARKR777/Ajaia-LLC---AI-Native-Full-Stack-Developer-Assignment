"use client";

import { Editor } from "@tiptap/react";

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded px-2 py-1 text-sm font-medium transition ${
        active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

export default function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const headingValue = editor.isActive("heading", { level: 1 })
    ? "1"
    : editor.isActive("heading", { level: 2 })
    ? "2"
    : editor.isActive("heading", { level: 3 })
    ? "3"
    : "0";

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-gray-200 bg-gray-50 p-2">
      <select
        aria-label="Text style"
        value={headingValue}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "0") {
            editor.chain().focus().setParagraph().run();
          } else {
            editor
              .chain()
              .focus()
              .toggleHeading({ level: Number(value) as 1 | 2 | 3 })
              .run();
          }
        }}
        className="mr-1 rounded border border-gray-200 bg-white px-2 py-1 text-sm"
      >
        <option value="0">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      <div className="mx-1 h-5 w-px bg-gray-200" />

      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <span className="underline">U</span>
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-gray-200" />

      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </ToolbarButton>
    </div>
  );
}
