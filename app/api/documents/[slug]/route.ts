import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await context.params;        
        const document = await prisma.document.findUnique({
            where: { slug },
        });

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        return NextResponse.json(document);
    } catch (error) {
        console.error('GET Error:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await context.params;
        const body = await request.json();
        const { title, content } = body;

        const updatedDocument = await prisma.document.update({
            where: { slug },
            data: { title, content },
        });

        return NextResponse.json(updatedDocument);
    } catch (error) {
        console.error('PUT Error:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}