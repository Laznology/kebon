import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        slug: true
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
  const defaultContent = {
    "type": "doc",
    "content": [
    ]
  }

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  const page = await prisma.page.create({
    data: {
      title,
      slug,
      content: defaultContent,
      authorId: session.user.id,
    },
  });
  return NextResponse.json(page, { status: 201 });
}
