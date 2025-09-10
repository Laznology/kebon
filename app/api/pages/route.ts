import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      include: {
        author: {
          select: { name: true },
        },
      },
    });
    return NextResponse.json(pages);
  } catch {
    return NextResponse.error();
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { title } = await request.json();

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  await prisma.page.create({
    data: {
      title,
      slug,
      authorId: session.user.id,
    },
  });
  return NextResponse.json({ success: true }, { status: 201 });
}
