'use client'
import { useState, useEffect } from "react";
import { Document } from "@/types/document";
import { convertNovelToMarkdown, convertNovelBlocksToMarkdown } from "@/lib/markdown-converter";

export default function DocsPage({ params }: { params: Promise<{ slug: string }> }) {
    const [document, setDocument] = useState<Document | null>(null);
    const [markdownContent, setMarkdownContent] = useState<string>('');

    useEffect(() => {
        async function fetchDocument() {
            const resolvedParams = await params
            const slug = resolvedParams.slug
            const response = await fetch(`/api/documents/${slug}`)
            const data = await response.json()
            setDocument(data)
            if (data?.content) {
                try {
                  // Try the full conversion first
                  const markdown = convertNovelToMarkdown(data.content);
                  console.log("Converted Markdown:", markdown);
                  setMarkdownContent(markdown);
                } catch (error) {
                  console.error('Error converting to markdown:', error);
                  // Fallback to simple conversion
                  if (data.content.blocks) {
                    const simpleMarkdown = convertNovelBlocksToMarkdown(data.content.blocks);
                    setMarkdownContent(simpleMarkdown);
                  }
                }
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
            
            <article className="prose prose-lg max-w-none">
                {markdownContent ? (
                    <div className="markdown-content">
                        <div dangerouslySetInnerHTML={{ __html: markdownContent }} />
                    </div>
                ) : (
                    <div className="text-gray-500 italic">
                        {document ? 'No content available' : 'Loading...'}
                    </div>
                )}
            </article>
        </div>
    );
}