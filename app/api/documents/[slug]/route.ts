import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const document = await prisma.document.findUnique({
            where: { slug }
        })

        if (!document){
            return NextResponse.json({ error: "Document not found"}, { status: 404 })
        }

    return NextResponse.json(document)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error"}, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }){
    try {
        const { slug } = await params;
        const body = await request.json()
        const { title, content } = body

        const updatedDocument = await prisma.document.update({
            where: { slug },
            data: { title, content }
        })

        return NextResponse.json(updatedDocument)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error"}, { status: 500 })
    }
}