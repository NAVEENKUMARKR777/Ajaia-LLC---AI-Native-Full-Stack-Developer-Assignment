import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSessionUser } from "@/lib/session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const userId = formData.get("userId");

  if (typeof userId !== "string" || !userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Unknown user" }, { status: 404 });
  }

  await setSessionUser(user.id);

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
