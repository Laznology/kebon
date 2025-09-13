import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = getServerSession();
  if (!session) {
    return NextResponse.json({ mesage: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const { published } = await request.json();
  if (typeof published !== "boolean") {
    return NextResponse.json(
      { error: "Invalid published value" },
      { status: 400 },
    );
  }
  try {
    await prisma.page.update({
      where: { slug },
      data: { published },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Page Not Found" }, { status: 404 });
  }
}
