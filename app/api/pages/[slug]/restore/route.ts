import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await prisma.page.update({
    where: { slug },
    data: {
      isDeleted: false,
    }
  })
  return NextResponse.json({ success: true })
}