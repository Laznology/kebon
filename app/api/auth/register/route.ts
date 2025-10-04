import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, confirmPassword } = body as {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };

  if (!email || !password || !confirmPassword) {
    return NextResponse.json(
      { message: "Please provide email, password, and confirmPassword." },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { message: "Passwords Confirmation do not match." },
      { status: 400 },
    );
  }

  const userExist = await prisma.user.findUnique({
    where: { email },
  });

  if (userExist) {
    return NextResponse.json(
      { message: "Email already registered" },
      { status: 409 },
    );
  }

  const hashedPass = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      password: hashedPass,
    },
  });

  return NextResponse.json({ message: "User created" }, { status: 201 });
}
