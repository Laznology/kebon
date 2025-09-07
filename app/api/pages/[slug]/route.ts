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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const { title, content } = body;

    if (!content || typeof content !== "object") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }

    // optional: log presence of marks for debugging
    try {
      const marksFound = JSON.stringify(content).includes("marks");
      if (marksFound)
        console.info(`Saving content with marks for page ${slug}`);
    } catch {}

    const updatedPage = await prisma.page.update({
      where: { slug },
      data: { title, content },
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
