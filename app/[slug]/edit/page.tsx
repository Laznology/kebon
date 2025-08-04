'use client';
import { useState, useEffect } from "react";
import { EditorBubble, EditorBubbleItem, EditorCommand, EditorCommandItem, EditorContent, EditorRoot, JSONContent } from "novel";
import { Document as DocumentType } from "@/types/document";
import React from "react";
import { defaultExtensions } from "@/lib/extensions";

export default function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
    const [document, setDocument] = useState<DocumentType | null>(null);
    const [content, setContent] = useState<JSONContent | undefined>(undefined);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const slug = React.use(params).slug;

    useEffect(() => {
        if (!slug) return;
        async function fetchDocument() {
            const response = await fetch(`/api/documents/${slug}`);
            if (!response.ok) {
                throw new Error("Failed to fetch document");
            }
            const data = await response.json();
            setDocument(data);

            const parsedContent: JSONContent = {
                type: "doc",
                content: [
                {
                    type: 'paragraph',
                    content: [{ type: "text", text: data.content }],
                }
                ]
            }
            setContent(parsedContent)
        }
        fetchDocument();
    }, [slug]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (document) {
                saveContent();
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    });

    async function saveContent() {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/documents/${slug}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: document?.title,
                    content: JSON.stringify(document?.content)
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save document");
            }
        } catch (error) {
            console.error("Error saving document:", error);
        } finally {
            setIsSaving(false);
        }
    }

    if (!document) return <p>Loading...</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{document.title}</h1>
            <EditorRoot>
                <EditorContent 
                    initialContent={content}
                    extensions={defaultExtensions}
                    className="border rounded-lg p-4">
                    <EditorCommand>
                        <EditorCommandItem
                            value="Bold"
                            onCommand={({ editor, range }) => {
                                editor.chain().focus().toggleBold().run();
                            }}
                            className="custom-class"
                        >
                            Bold
                        </EditorCommandItem>
                        <EditorCommandItem
                            value="Italic"
                            onCommand={({ editor, range }) => {
                                editor.chain().focus().toggleItalic().run();
                            }}
                            className="custom-class"
                        >
                            Italic
                        </EditorCommandItem>
                        <EditorCommandItem
                            value="Underline"
                            onCommand={({ editor, range }) => {
                                editor.chain().focus().toggleUnderline().run();
                            }}
                            className="custom-class"
                        >
                            Underline
                        </EditorCommandItem>
                    </EditorCommand>
                    <EditorBubble>
                        <EditorBubbleItem
                            key="bold"
                            onSelect={(editor) => {
                                editor.chain().focus().toggleBold().run();
                            }}
                            className="custom-class"
                        >
                            Bold
                        </EditorBubbleItem>
                        <EditorBubbleItem
                            key="italic"
                            onSelect={(editor) => {
                                editor.chain().focus().toggleItalic().run();
                            }}
                            className="custom-class"
                        >
                            Italic
                        </EditorBubbleItem>
                        <EditorBubbleItem
                            key="underline"
                            onSelect={(editor) => {
                                editor.chain().focus().toggleUnderline().run();
                            }}
                            className="custom-class"
                        >
                            Underline
                        </EditorBubbleItem>
                    </EditorBubble>
                </EditorContent>
            </EditorRoot>
        </div>
    );
}