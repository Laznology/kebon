'use client'
import { Document } from "@/types/document"
import { EditorRoot, EditorContent, JSONContent } from "novel"
import { defaultExtensions } from "@/lib/extensions"
import { useState, useEffect, useRef, useCallback } from "react"
import { handleCommandNavigation } from "novel"



type saveStatus = 'saved' | 'saving' | 'error' | 'unsaved'



export default function EditPage({ params }: { params: Promise<{ slug: string }> }) {
    const [document, setDocument] = useState<JSONContent | undefined>(undefined);
    const [data, setData] = useState<Document | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [savingSatatus, setSavignStatus] = useState<saveStatus>('saved') 
    const [slug, setSlug] = useState<string>('')
    
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastContentRef = useRef<string>('')
    const initalLoadRef = useRef<boolean>(true)

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

    const convertJSONContentToBlocks = (content: JSONContent) => {
        if (!content.content) return [];

        return content.content.map((block) => ({
            type: block.type,
            data: {
                text: block.content?.[0]?.text || "",
            },
        }));
    };

    const autoSave = useCallback(async (content: JSONContent, title: string) => {
        if (!slug || initalLoadRef.current) return;

        const blocks = convertJSONContentToBlocks(content);
        const contentString = JSON.stringify(blocks);

        if (contentString === lastContentRef.current) return;
        try {
            setSavignStatus('saving');
            const response = await fetch(`/api/pages/${slug}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content: { blocks },
                }),
            });
            if (!response.ok) {
                throw new Error("Failed to save");
            }
            lastContentRef.current = contentString;
            setSavignStatus('saved');
        } catch (error) {
            console.error('Auto-save Error', error);
            setSavignStatus('error');
        }
    }, [slug])

    const debounceAutoSave = useCallback(async (content: JSONContent, title: string) => {
        setSavignStatus('unsaved')
        if (saveTimeoutRef.current){
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(() => {
            autoSave(content, title)
        }, 5000)
    }, [autoSave])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resolvedParams = await params
                const currentSlug = resolvedParams.slug
                setSlug(currentSlug)
                const response = await fetch(`/api/pages/${currentSlug}`)
                if(!response.ok) throw new Error("Failed to fetch")

                    
                const jsonDoc = await response.json()
                setData(jsonDoc)

                let initialContent: JSONContent | undefined
                if (jsonDoc.content && Array.isArray(jsonDoc.content.blocks)) {
                    initialContent = convertBlocksToJSONContent(jsonDoc.content.blocks);
                } else {
                    initialContent = jsonDoc.content;
                }
                if (initialContent) {
                    setDocument(initialContent);
                    lastContentRef.current = JSON.stringify(initialContent);
                } else {
                    setDocument({
                        type: "doc",
                        content: [],
                    });
                }
                console.log('Data: ', initialContent)
            } catch (error) {
                console.error('Error fetching data', error)
            } finally {
                setLoading(false)
                setTimeout(() => {
                    initalLoadRef.current = false
                }, 100)
            }
        }
        
        fetchData()
    }, [params]);


    if (loading) return <div>Loading ...</div>;
    return (
        <div className="mx-auto container p-4">
            <div className="">
                <h1 className="font-bold text-2xl">{data?.title}</h1>
            </div>
            {savingSatatus === 'saving' ? <span>Saving</span> : null}
            <div className="prose dark:prose-invert">
                <EditorRoot>
                    <EditorContent
                        {...(document && { initialContent: document })}
                        extensions={[...defaultExtensions]}
                        editorProps={{
                            handleDOMEvents: {
                                keydown: (_view, event) => handleCommandNavigation(event)
                            },
                            attributes: {
                                class: "prose prose-lg dark:prose-invert focus:outline-none max-w-full"
                            }
                        }}
                        onUpdate={({ editor }) => {
                            if (initalLoadRef.current) return;

                            const content = editor.getJSON();
                            setDocument(content);
                            
                            if (data?.title) {
                                debounceAutoSave(content, data.title);
                            }
                        }}
                    >
                    </EditorContent>
                </EditorRoot>
            </div>
        </div>
    );
}