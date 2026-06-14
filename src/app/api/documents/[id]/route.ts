import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { canEdit, canView, canManageSharing } from "@/lib/access";

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 2_000_000; // ~2MB of JSON, generous for a text document

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: { shares: { include: { user: true } }, owner: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (!canView(document, document.shares, userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: document.id,
    title: document.title,
    content: document.content,
    ownerId: document.ownerId,
    ownerName: document.owner.name,
    isOwner: document.ownerId === userId,
    canManageSharing: canManageSharing(document, userId),
    updatedAt: document.updatedAt,
    shares: document.shares.map((s) => ({
      id: s.id,
      userId: s.userId,
      name: s.user.name,
      email: s.user.email,
    })),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: { shares: true },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (!canEdit(document, document.shares, userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const data: { title?: string; content?: string } = {};

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json({ error: "Title is too long" }, { status: 400 });
    }
    data.title = title;
  }

  if (body.content !== undefined) {
    if (typeof body.content !== "string") {
      return NextResponse.json({ error: "Content must be a JSON string" }, { status: 400 });
    }
    if (body.content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json({ error: "Content is too large" }, { status: 400 });
    }
    try {
      JSON.parse(body.content);
    } catch {
      return NextResponse.json({ error: "Content must be valid JSON" }, { status: 400 });
    }
    data.content = body.content;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.document.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ id: updated.id, updatedAt: updated.updatedAt });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const document = await prisma.document.findUnique({ where: { id: params.id } });
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (document.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.document.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
