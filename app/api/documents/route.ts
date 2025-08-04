import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const documents = await prisma.document.findMany({
            include: {
                author: true,
            }
        });
        return NextResponse.json(documents);
    } catch {
        return NextResponse.error();
    }
}