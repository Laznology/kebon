import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    const settings = await prisma.appSettings.findFirst();
    return NextResponse.json({ data: settings }, { status: 200 });
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

    if (!session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    
    const existingSettings = await prisma.appSettings.findFirst();
    
    let updated;
    if (existingSettings) {
      updated = await prisma.appSettings.update({
        where: { id: existingSettings.id },
        data: body,
      });
    } else {
      updated = await prisma.appSettings.create({
        data: body,
      });
    }
    
    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update Setting", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
