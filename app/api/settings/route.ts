import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const settings = await prisma.appSettings.findFirst();
    return NextResponse.json(settings, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Setting" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updated = await prisma.appSettings.update({
      where: { id: 1 },
      data: body,
    });
    return NextResponse.json({ data: updated }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update Setting" },
      { status: 500 },
    );
  }
}
