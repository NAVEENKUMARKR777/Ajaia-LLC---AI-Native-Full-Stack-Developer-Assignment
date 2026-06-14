import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { markdownToDoc } from "@/lib/markdownToDoc";

const MAX_FILE_SIZE = 1_000_000; // 1MB
const ALLOWED_EXTENSIONS = [".txt", ".md"];

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const name = file.name || "Untitled";
  const extension = name.slice(name.lastIndexOf(".")).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return NextResponse.json(
      { error: `Unsupported file type "${extension}". Only .txt and .md files are supported.` },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File is too large (max 1MB)" }, { status: 400 });
  }

  const text = await file.text();
  const docJson = markdownToDoc(text);

  const title = name.slice(0, name.lastIndexOf(".")) || "Imported document";

  const document = await prisma.document.create({
    data: {
      title: title.slice(0, 200),
      ownerId: userId,
      content: JSON.stringify(docJson),
    },
  });

  return NextResponse.json({ id: document.id }, { status: 201 });
}
