import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

export async function POST(
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
    return NextResponse.json({ error: "Only the owner can share this document" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) {
    return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
  }

  if (targetUser.id === userId) {
    return NextResponse.json({ error: "You already own this document" }, { status: 400 });
  }

  const existing = await prisma.share.findUnique({
    where: { documentId_userId: { documentId: params.id, userId: targetUser.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already shared with this user" }, { status: 409 });
  }

  const share = await prisma.share.create({
    data: { documentId: params.id, userId: targetUser.id },
  });

  return NextResponse.json(
    { id: share.id, userId: targetUser.id, name: targetUser.name, email: targetUser.email },
    { status: 201 }
  );
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
    return NextResponse.json({ error: "Only the owner can manage sharing" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const targetUserId = typeof body.userId === "string" ? body.userId : "";
  if (!targetUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  await prisma.share.deleteMany({
    where: { documentId: params.id, userId: targetUserId },
  });

  return NextResponse.json({ ok: true });
}
