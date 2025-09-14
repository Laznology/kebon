import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { allowRegister } = body;
  if (allowRegister === "undefined") {
    return NextResponse.json(
      { message: "'allowRegister' is required" },
      { status: 400 },
    );
  }

  if (typeof allowRegister !== "boolean") {
    return NextResponse.json(
      { message: "'allowRegister' must type of boolean" },
      { status: 400 },
    );
  }

  await prisma.appSettings.upsert({
    where: { id: 1 },
    update: { allowRegister: allowRegister },
    create: { id: 1, allowRegister: allowRegister },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
