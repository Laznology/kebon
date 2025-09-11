import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const pages = await prisma.page.findUnique({
      where: { slug },
    });

    if (!pages) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(pages);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

function slugify(text: string) {
  return text
    .toString()
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = (await req.json()) as {
    title?: string;
    content?: string;
    published?: boolean;
  };
  let newSlug = body.title;
  if (body.title) {
    newSlug = slugify(body?.title || "");
  }

  if (
    !body ||
    (!("title" in body) && !("content" in body) && !("published" in body))
  ) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.page.update({
      where: { slug },
      data: { ...body, slug: newSlug, updatedAt: new Date() },
      select: {
        title: true,
        slug: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  await prisma.page.update({
    where: { slug },
    data: {
      isDeleted: true,
    },
  });
  return NextResponse.json({ success: true });
}
