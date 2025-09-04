import {NextRequest, NextResponse} from "next/server";
import { prisma } from "@/lib/prisma";
import {getServerSession} from "next-auth";
import next from "next-auth/src";

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

export async function POST(request: NextRequest) {
    const session = getServerSession()
    if (!session) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        )
    }
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    const body = await request.json
    const { title, slug, content, image, published } = body
    const data = request.body;
    const newPage = prisma.page.create({
        data: {
            title,
            slug,
            content,
            image,
            published,
            authorId: user?.id,
        },
        include: {
            author: {
                name: true
            }
        }
    })
    return NextResponse.json(
        { message: "Success Create New Page" },
        { status: 201 }
    )
}