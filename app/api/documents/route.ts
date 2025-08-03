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
    } catch (error) {
        console.error("Error fetching documents: ", error)
        return NextResponse.error();
    }
}

export async function POST() {
    try {

    } catch (error) {
        return NextResponse.json({ error: "Error adding Document"})
    }
}