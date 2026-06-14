import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });
const MAX_TITLE_LENGTH = 200;

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [owned, sharedWithMe] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.document.findMany({
      where: { shares: { some: { userId } } },
      include: { owner: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    owned: owned.map((d) => ({
      id: d.id,
      title: d.title,
      updatedAt: d.updatedAt,
    })),
    sharedWithMe: sharedWithMe.map((d) => ({
      id: d.id,
      title: d.title,
      updatedAt: d.updatedAt,
      ownerName: d.owner.name,
    })),
  });
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  let title = typeof body.title === "string" ? body.title.trim() : "Untitled document";
  if (!title) title = "Untitled document";
  if (title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: "Title is too long" }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content : EMPTY_DOC;

  const document = await prisma.document.create({
    data: { title, ownerId: userId, content },
  });

  return NextResponse.json({ id: document.id }, { status: 201 });
}
