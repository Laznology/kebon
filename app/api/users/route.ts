import authOptions from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorize" }, { status: 401 });
    }
    const users = await prisma.user.findMany();
    return NextResponse.json({ data: users }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Error durring fetching" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorize" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const { email, name, password, role } = body;
    if (!email || !name || !password || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password,
        role,
      },
    });
    return NextResponse.json({ data: user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorize" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const { id, email, name, role } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { email, name, role },
    });
    return NextResponse.json({ data: user }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorize" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const userPages = await prisma.page.findMany({
      where: { authorId: id, isDeleted: false },
      select: { id: true, title: true },
    });

    if (userPages.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete user with existing pages",
          details: `User has ${userPages.length} page(s). Please reassign or delete their pages first.`
        },
        { status: 400 }
      );
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ 
      error: "Error deleting user",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
