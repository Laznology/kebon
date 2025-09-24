import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { JSONContent } from '@tiptap/core';

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(pages);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("No session or user ID:", { session: !!session, userId: session?.user?.id });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User found:", { userId: session.user.id });

    const { title } = await request.json();
    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: "Page with this title already exists" },
        { status: 409 },
      );
    }

    // Create new page
    const newPage = await prisma.page.create({
      data: {
        title,
        slug,
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: title }],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Start writing your content here...' }],
            },
          ],
        } as JSONContent,
        published: false,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      page: newPage,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create new page" },
      { status: 500 },
    );
  }
}
