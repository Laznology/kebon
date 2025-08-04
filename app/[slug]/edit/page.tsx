'use client';
import { useState, useEffect, useCallback } from "react";
import { EditorBubble, EditorBubbleItem, EditorCommand, EditorCommandItem, EditorContent, EditorRoot, JSONContent } from "novel";
import { Document as DocumentType } from "@/types/document";
import React from "react";
import { defaultExtensions } from "@/lib/extensions";

export default function EditorPage({ params }: { params: Promise<{ slug: string }> }) {
    const [document, setDocument] = useState<DocumentType | null>(null);
    const [content, setContent] = useState<JSONContent | undefined>(undefined);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const slug = React.use(params).slug;

    // Fetches the document content when the component mounts or the slug changes.
    useEffect(() => {
        if (!slug) return;
        async function fetchDocument() {
            try {
                const response = await fetch(`/api/documents/${slug}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch document");
                }
                const data = await response.json();
                setDocument(data);

                // Parse content properly - handle different content formats
                let parsedContent: JSONContent;
                
                if (typeof data.content === 'string') {
                    try {
                        // Try to parse as JSON first
                        const contentObj = JSON.parse(data.content);
                        if (contentObj.type === 'doc') {
                            // Already in TipTap format
                            parsedContent = contentObj;
                        } else {
                             // Fallback for other JSON formats, assuming plain text if structure is unknown
                            parsedContent = {
                                type: "doc",
                                content: [{ type: 'paragraph', content: [{ type: "text", text: data.content }] }]
                            };
                        }
                    } catch (error) {
                        // FIX: Use the 'error' variable to log the parsing error.
                        console.error("Error parsing content JSON:", error);
                        // If parsing fails, treat as plain text
                        parsedContent = {
                            type: "doc",
                            content: [{ type: 'paragraph', content: [{ type: "text", text: data.content }] }]
                        };
                    }
                } else if (data.content && typeof data.content === 'object') {
                    // Already a JSON object (assumed to be in TipTap format)
                    parsedContent = data.content;
                } else {
                    // Default empty content
                    parsedContent = {
                        type: "doc",
                        content: [{ type: 'paragraph', content: [{ type: "text", text: "" }] }]
                    };
                }
                
                setContent(parsedContent);
            } catch (error) {
                console.error("Failed to fetch document:", error);
            }
        }
        fetchDocument();
    }, [slug]);

    // Memoize the saveContent function to prevent it from being recreated on every render.
    // This is necessary for the auto-save useEffect dependency array.
    const saveContent = useCallback(async () => {
        if (!content || !document) return;
        
        setIsSaving(true);
        try {
            const response = await fetch(`/api/documents/${slug}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: document?.title,
                    content: JSON.stringify(content) // Save the current editor content
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
    }, [slug, content, document]); // Dependencies for the useCallback

    // Auto-save with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Check if there is content and a document before saving
            if (content && document) {
                saveContent();
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    // FIX: Added 'saveContent' to the dependency array to resolve the linting warning.
    }, [content, document, saveContent]);

    if (!document) return <div className="text-center p-8">Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">{document.title}</h1>
                {isSaving && <span className="text-sm text-gray-500 animate-pulse">Saving...</span>}
            </div>
            <EditorRoot>
                <EditorContent 
                    // Use a key to force re-initialization when content loads
                    key={JSON.stringify(content)}
                    initialContent={content}
                    extensions={defaultExtensions}
                    onUpdate={({ editor }) => {
                        setContent(editor.getJSON());
                    }}
                    editorProps={{
                        attributes: {
                            class: 'prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full min-h-[500px] p-4 border rounded-lg',
                        },
                    }}
                    className="min-h-[500px]"
                >
                    <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
                        <EditorCommandItem
                            value="Bold"
                            onCommand={({ editor }) => {
                                editor.chain().focus().toggleBold().run();
                            }}
                            className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                        >
                            <span className="font-bold">B</span>
                            <span>Bold</span>
                        </EditorCommandItem>
                        <EditorCommandItem
                            value="Italic"
                            onCommand={({ editor }) => {
                                editor.chain().focus().toggleItalic().run();
                            }}
                            className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                        >
                            <span className="italic">I</span>
                            <span>Italic</span>
                        </EditorCommandItem>
                        <EditorCommandItem
                            value="Heading 1"
                             // FIX: Corrected the command to toggle Heading 1. The 'range' variable was not defined.
                            onCommand={({ editor }) => {
                                editor.chain().focus().toggleHeading({ level: 1 }).run();
                            }}
                            className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                        >
                            <span className="text-lg font-bold">H1</span>
                            <span>Heading 1</span>
                        </EditorCommandItem>
                    </EditorCommand>
                    <EditorBubble className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl">
                        <EditorBubbleItem
                            key="bold"
                            onSelect={(editor) => {
                                editor.chain().focus().toggleBold().run();
                            }}
                            className="p-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            Bold
                        </EditorBubbleItem>
                        <EditorBubbleItem
                            key="italic"
                            onSelect={(editor) => {
                                editor.chain().focus().toggleItalic().run();
                            }}
                            className="p-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            Italic
                        </EditorBubbleItem>
                        <EditorBubbleItem
                            key="underline"
                            onSelect={(editor) => {
                                editor.chain().focus().toggleUnderline().run();
                            }}
                            className="p-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            Underline
                        </EditorBubbleItem>
                    </EditorBubble>
                </EditorContent>
            </EditorRoot>
        </div>
    );
}
