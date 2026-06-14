/**
 * Lightweight converter from plain text / a small Markdown subset into a
 * Tiptap (ProseMirror) JSON document. Intentionally hand-rolled (no DOM
 * dependency) so it works in both the server upload route and unit tests.
 *
 * Supported syntax:
 *  - "# ", "## ", "### " headings (levels 1-3)
 *  - "- " / "* " bullet lists
 *  - "1. " ordered lists
 *  - **bold**, *italic* / _italic_
 *  - blank-line separated paragraphs
 */

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: { type: string }[];
  text?: string;
};

export type TiptapDoc = {
  type: "doc";
  content: TiptapNode[];
};

const BULLET_RE = /^[-*]\s+(.*)$/;
const ORDERED_RE = /^\d+\.\s+(.*)$/;
const HEADING_RE = /^(#{1,3})\s+(.*)$/;

export function parseInline(text: string): TiptapNode[] {
  if (!text) return [];

  const result: TiptapNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(_(.+?)_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({ type: "text", text: text.slice(lastIndex, match.index) });
    }
    if (match[1]) {
      result.push({ type: "text", marks: [{ type: "bold" }], text: match[2] });
    } else if (match[3]) {
      result.push({ type: "text", marks: [{ type: "italic" }], text: match[4] });
    } else if (match[5]) {
      result.push({ type: "text", marks: [{ type: "italic" }], text: match[6] });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push({ type: "text", text: text.slice(lastIndex) });
  }

  return result;
}

function paragraph(text: string): TiptapNode {
  const inline = parseInline(text);
  return inline.length > 0 ? { type: "paragraph", content: inline } : { type: "paragraph" };
}

export function markdownToDoc(input: string): TiptapDoc {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const content: TiptapNode[] = [];
  let paragraphBuffer: string[] = [];
  let i = 0;

  function flushParagraph() {
    if (paragraphBuffer.length === 0) return;
    const text = paragraphBuffer.join(" ").trim();
    paragraphBuffer = [];
    if (!text) return;
    content.push(paragraph(text));
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      flushParagraph();
      i++;
      continue;
    }

    const headingMatch = line.match(HEADING_RE);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      const inline = parseInline(headingMatch[2].trim());
      content.push({
        type: "heading",
        attrs: { level },
        ...(inline.length > 0 ? { content: inline } : {}),
      });
      i++;
      continue;
    }

    if (BULLET_RE.test(line)) {
      flushParagraph();
      const items: TiptapNode[] = [];
      while (i < lines.length) {
        const m = lines[i].match(BULLET_RE);
        if (!m) break;
        items.push({ type: "listItem", content: [paragraph(m[1].trim())] });
        i++;
      }
      content.push({ type: "bulletList", content: items });
      continue;
    }

    if (ORDERED_RE.test(line)) {
      flushParagraph();
      const items: TiptapNode[] = [];
      while (i < lines.length) {
        const m = lines[i].match(ORDERED_RE);
        if (!m) break;
        items.push({ type: "listItem", content: [paragraph(m[1].trim())] });
        i++;
      }
      content.push({ type: "orderedList", content: items });
      continue;
    }

    paragraphBuffer.push(line.trim());
    i++;
  }

  flushParagraph();

  if (content.length === 0) {
    content.push({ type: "paragraph" });
  }

  return { type: "doc", content };
}
