'use client'
import { Document } from "@/types/document"
import { EditorRoot, EditorContent, JSONContent } from "novel"
import { defaultExtensions } from "@/lib/extensions"
import { useState, useEffect } from "react"
import { handleCommandNavigation } from "novel"

export default function EditPage({ params }: { params: Promise<{ slug: string }> }) {
    const [document, setDocument] = useState<JSONContent | undefined>(undefined);
    const [data, setData] = useState<Document | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const convertBlocksToJSONContent = (blocks: { type: string; data: { text: string }}[]) => {
        return {
            type: "doc",
            content: blocks.map((block) => ({
                type: block.type,
                content: [
                    {
                        type: "text",
                        text: block.data.text,
                    },
                ],
            })),
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const resolvedSlug = await params
            const slug = resolvedSlug.slug
            const response = await fetch(`/api/documents/${slug}`)
            const jsonData = await response.json()
            setData(jsonData)
            setLoading(false)

            if (jsonData.content && jsonData.content.blocks) {
                const convertedContent = convertBlocksToJSONContent(jsonData.content.blocks)
                setDocument(convertedContent)
            }
        };
        
        fetchData();
    });

    if (loading) return <div>Loading ...</div>;
    return (
        <div className="mx-auto container p-4">
            <div className="">
                <h1 className="font-bold text-2xl">{data?.title}</h1>
            </div>
            <div className="prose dark:prose-invert">
                <EditorRoot>
                    <EditorContent
                        editorProps={{
                            handleDOMEvents: {
                                keydown: (_view, event) => handleCommandNavigation(event)
                            },
                            attributes: {
                                class: "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full"
                            }
                        }}
                        initialContent={document}
                        extensions={[...defaultExtensions]}
                    >
                    </EditorContent>
                </EditorRoot>
            </div>
        </div>
    );
}