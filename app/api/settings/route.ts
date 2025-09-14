import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(){
  const settings = await prisma.appSettings.findFirst();
  return NextResponse.json(settings);
}