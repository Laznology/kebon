import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const pages = await prisma.page.findMany({
            include: {
                author: {
                    select: { name: true },
                }
            }
        });
        return NextResponse.json(pages);
    } catch {
        return NextResponse.error();
    }
}