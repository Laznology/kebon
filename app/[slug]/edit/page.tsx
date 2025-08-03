'use client';
import { useState, useEffect } from "react";
import { EditorBubble, EditorBubbleItem, EditorCommand, EditorContent, EditorRoot } from "novel";
import { Document as DocumentType } from "@/types/document";
import React from "react";
import { defaultExtensions } from "@/lib/extensions";

export default function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
    const [document, setDocument] = useState<DocumentType | null>(null);
    const [content, setContent] = useState<string>("");
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
            setContent(data.content);
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
    }, [content]);

    async function saveContent() {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/documents/${slug}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content }),
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
            <EditorRoot
                value={content}
                onChange={setContent}
                extensions={defaultExtensions}
                className="border rounded-lg p-4"
            >
                <EditorBubble>
                    <EditorBubbleItem command={EditorCommand.Bold} />
                    <EditorBubbleItem command={EditorCommand.Italic} />
                    <EditorBubbleItem command={EditorCommand.Underline} />
                </EditorBubble>
                <EditorContent />
            </EditorRoot>
            {isSaving && <p className="text-sm text-gray-500">Saving...</p>}
        </div>
    );
}