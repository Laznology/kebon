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
            <div className="bg-white dark:bg-gray-900 ">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">{document?.title}</h1>
                        {document?.author && (
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {(document.author.name || document.author.email).charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {document.author.name || document.author.email}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            document?.published 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                            {document?.published ? 'Published' : 'Draft'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div className="flex items-center gap-1">
                        <span>Last updated: {document?.updatedAt ? new Date(document.updatedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        }) : 'Unknown'}</span>
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900">
                <article className="prose prose-base max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-h1:text-xl prose-h1:font-semibold prose-h2:text-lg prose-h2:font-semibold prose-h3:text-base prose-h3:font-semibold py-12">
                    {markdownContent ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
                    ) : (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="text-4xl mb-3"></div>
                                <div className="text-gray-500 dark:text-gray-400 italic">
                                    {document ? 'No content available' : 'Loading...'}
                                </div>
                            </div>
                        </div>
                    )}
                </article>
            </div>
        </div>
    );
}