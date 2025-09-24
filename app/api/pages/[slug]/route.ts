import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { JSONContent } from "@tiptap/core";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!slug) {
    return new NextResponse("Bad Request: slug is required", { status: 400 });
  }

  try {
    const page = await prisma.page.findUnique({
      where: {
        slug: slug,
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
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!slug) {
    return new NextResponse("Bad Request: slug is required", { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, title, tags, published } = await request.json();

    const existingPage = await prisma.page.findUnique({
      where: { slug: slug, isDeleted: false },
    });

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const extractTextFromContent = (content: JSONContent): string => {
      if (!content) return "";

      let text = "";
      if (content.text) {
        text += content.text;
      }

      if (content.content) {
        text += content.content.map(extractTextFromContent).join(" ");
      }

      return text;
    };

    const textContent = content ? extractTextFromContent(content) : "";
    const excerpt = textContent.slice(0, 200).trim();

    const updatedPage = await prisma.page.update({
      where: { id: existingPage.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(tags && { tags }),
        ...(typeof published === "boolean" && { published }),
        excerpt: excerpt || null,
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

    await prisma.pageVersion.create({
      data: {
        pageId: existingPage.id,
        content: content || null,
      },
    });

    return NextResponse.json({ success: true, page: updatedPage });
  } catch {
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!slug) {
    return new NextResponse("Bad Request: slug is required", { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingPage = await prisma.page.findUnique({
      where: { slug: slug, isDeleted: false },
    });

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await prisma.page.update({
      where: { id: existingPage.id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 },
    );
  }
}
