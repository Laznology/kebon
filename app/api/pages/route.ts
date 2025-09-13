import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const published = searchParams.get("published")
    ? searchParams.get("published") === "true"
    : undefined;
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;
  try {
    const pages = await prisma.page.findMany({
      where: {
        isDeleted: false,
        published: published,
      },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        published: published,
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
    type: "doc",
    content: [],
  };

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  const existing = await prisma.page.findUnique({
    where: { slug },
  });
  if (existing) {
    return NextResponse.json({ message: "Slug already exists" });
  }
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
