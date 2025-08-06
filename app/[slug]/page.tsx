'use client'
import { useState, useEffect } from "react";
import { Document } from "@/types/document";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import json2md from 'json2md';

export default function DocsPage({ params }: { params: Promise<{ slug: string }> }) {
    const [document, setDocument] = useState<Document | null>(null);
    const [markdownContent, setMarkdownContent] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDocument() {
            const resolvedParams = await params;
            const slug = resolvedParams.slug;
            const response = await fetch(`/api/pages/${slug}`);
            const data = await response.json();
            setDocument(data);

            if (data?.content?.blocks) {
                const markdown = json2md(data.content.blocks.map((block: { type: string; data: { text?: string; items?: string[] } }) => {
                    switch (block.type) {
                        case 'paragraph':
                            return { p: block.data.text };
                        case 'header':
                            return { h1: block.data.text };
                        case 'list':
                            return { ul: block.data.items };
                        default:
                            return null;
                    }
                }).filter(Boolean));
                setMarkdownContent(markdown);
            } else {
                setMarkdownContent('');
            }
        }
        fetchDocument();
    }, [params]);

    return (
        <div className="container mx-auto max-w-4xl p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">{document?.title}</h1>
                {document?.author && (
                    <p className="text-gray-600 mb-2">
                        By {document.author.name || document.author.email}
                    </p>
                )}
                <p className="text-sm text-gray-500">
                    {document?.published ? 'Published' : 'Draft'} • 
                    Last updated: {document?.updatedAt ? new Date(document.updatedAt).toLocaleDateString() : 'Unknown'}
                </p>
            </div>
            
            <article className="prose prose-lg max-w-none dark:prose-invert">
                {markdownContent ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
                ) : (
                    <div className="text-gray-500 italic">
                        {document ? 'No content available' : 'Loading...'}
                    </div>
                )}
            </article>
        </div>
    );
}