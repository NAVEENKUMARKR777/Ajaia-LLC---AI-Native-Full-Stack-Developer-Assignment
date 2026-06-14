import { describe, it, expect } from "vitest";
import { markdownToDoc, parseInline } from "@/lib/markdownToDoc";

describe("parseInline", () => {
  it("returns plain text with no marks", () => {
    expect(parseInline("hello world")).toEqual([{ type: "text", text: "hello world" }]);
  });

  it("parses bold text", () => {
    expect(parseInline("hello **world**")).toEqual([
      { type: "text", text: "hello " },
      { type: "text", marks: [{ type: "bold" }], text: "world" },
    ]);
  });

  it("parses italic text with * and _", () => {
    expect(parseInline("*one* and _two_")).toEqual([
      { type: "text", marks: [{ type: "italic" }], text: "one" },
      { type: "text", text: " and " },
      { type: "text", marks: [{ type: "italic" }], text: "two" },
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(parseInline("")).toEqual([]);
  });
});

describe("markdownToDoc", () => {
  it("converts a heading", () => {
    const doc = markdownToDoc("# Title");
    expect(doc.content[0]).toEqual({
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Title" }],
    });
  });

  it("converts a plain paragraph", () => {
    const doc = markdownToDoc("Just a paragraph.");
    expect(doc.content[0]).toEqual({
      type: "paragraph",
      content: [{ type: "text", text: "Just a paragraph." }],
    });
  });

  it("converts a bullet list", () => {
    const doc = markdownToDoc("- one\n- two");
    expect(doc.content[0]).toEqual({
      type: "bulletList",
      content: [
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "one" }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "two" }] }] },
      ],
    });
  });

  it("converts an ordered list", () => {
    const doc = markdownToDoc("1. first\n2. second");
    expect(doc.content[0].type).toBe("orderedList");
    expect(doc.content[0].content).toHaveLength(2);
  });

  it("returns a single empty paragraph for empty input", () => {
    const doc = markdownToDoc("");
    expect(doc).toEqual({ type: "doc", content: [{ type: "paragraph" }] });
  });

  it("joins consecutive plain lines into one paragraph", () => {
    const doc = markdownToDoc("line one\nline two");
    expect(doc.content).toHaveLength(1);
    expect(doc.content[0].type).toBe("paragraph");
  });
});
