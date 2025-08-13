'use client'
import { Document } from "@/types/document"
import { EditorRoot, EditorContent, JSONContent, EditorCommand, EditorCommandEmpty, EditorCommandItem, EditorCommandList, handleCommandNavigation, EditorBubble } from "novel"
import { defaultExtensions } from "@/lib/extensions"
import { useState, useEffect, useRef, useCallback } from "react"
import { suggestionItems } from "@/components/editor/slash-command"
import { NodeSelector } from "@/components/editor/bubble/node-selector"


type saveStatus = 'saved' | 'saving' | 'error' | 'unsaved'



export default function EditPage({ params }: { params: Promise<{ slug: string }> }) {
    const [initialContent, setInitialContent] = useState<JSONContent | null>(null)
    const [data, setData] = useState<Document | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saveStatus, setSaveStatus] = useState<saveStatus>('saved') 
    const [slug, setSlug] = useState<string>('')
    const [openNode, setOpenNode] = useState<boolean>(false)
    
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastContentRef = useRef<string>('')
    const initialLoadRef = useRef<boolean>(true)


    const convertBlocksToJSONContent = (blocks: { type: string; data: { text: string; level?: number }}[]) => {
        if (!blocks || blocks.length === 0) {
            return {
                type: "doc",
                content: [{
                    type: "paragraph",
                    content: []
                }]
            };
        }
        
        return {
            type: "doc",
            content: blocks.map((block) => {
                switch (block.type) {
                    case 'paragraph':
                        return {
                            type: "paragraph",
                            content: block.data.text ? [{
                                type: "text",
                                text: block.data.text,
                            }] : []
                        }
                    case 'header':
                        return {
                            type: "heading",
                            attrs: { level: block.data.level || 1 },
                            content: block.data.text ? [{
                                type: "text",
                                text: block.data.text,
                            }] : []
                        }
                    case 'list':
                        return {
                            type: "bulletList",
                            content: []
                        }
                    default:
                        return {
                            type: "paragraph",
                            content: block.data.text ? [{
                                type: "text",
                                text: block.data.text,
                            }] : [],
                        }
                }
            }),
        }
    }

    const convertJSONContentToBlocks = (content: JSONContent) => {
        if (!content.content || !Array.isArray(content.content)) return []

        return content.content.map((block) => {
            if (block.type === 'heading') {
                return {
                    type: "header",
                    data: {
                        text: block.content?.[0]?.text || "",
                        level: block.attrs?.level || 1,
                    },
                };
            }
            if (block.type === 'bulletList') {
                const items = block.content?.map(item => 
                    item.content?.[0]?.content?.[0]?.text || ""
                ).filter(Boolean) || [];
                return {
                    type: "list",
                    data: {
                        items: items,
                    },
                };
            }
            return {
                type: block.type === 'paragraph' ? 'paragraph' : block.type || "paragraph",
                data: {
                    text: block.content?.[0]?.text || "",
                },
            };
        });
    };

    const autoSave = useCallback(async (content: JSONContent, title: string) => {
        if (!slug || initialLoadRef.current) return;

        const blocks = convertJSONContentToBlocks(content)
        const contentString = JSON.stringify(blocks)

        if (contentString === lastContentRef.current) return;
        try {
            setSaveStatus('saving');
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
                throw new Error("Failed to save")
            }
            lastContentRef.current = contentString
            setSaveStatus('saved')
        } catch (error) {
            console.error('Auto-save Error', error)
            setSaveStatus('error')
        }
    }, [slug])

    const debounceAutoSave = useCallback(async (content: JSONContent, title: string) => {
        setSaveStatus('unsaved')
        if (saveTimeoutRef.current){
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(() => {
            autoSave(content, title)
        }, 2000)
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
                    initialContent = convertBlocksToJSONContent(jsonDoc.content.blocks)
                } else if (jsonDoc.content) {
                    initialContent = jsonDoc.content
                } else {
                    initialContent = {
                        type: "doc",
                        content: [
                            {
                                type: "paragraph",
                                content: []
                            }
                        ]
                    };
                }
                
                setInitialContent(initialContent || null)
                if (initialContent) {
                    lastContentRef.current = JSON.stringify(convertJSONContentToBlocks(initialContent));
                }
            } catch (error) {
                console.error('Error fetching data', error)
            } finally {
                setLoading(false)
                setTimeout(() => {
                    initialLoadRef.current = false
                }, 100)
            }
        }
        
        fetchData()
    }, [params]);


    if (loading || !initialContent) return (
        <div className="flex justify-center items-center h-screen">
            <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
                <span className="text-lg text-gray-600 dark:text-gray-400">Loading editor...</span>
            </div>
        </div>
    )
    
    return (
        <div className="container mx-auto max-w-4xl p-6">
            <div className="bg-white dark:bg-gray-900 ">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">{data?.title}</h1>
                        {data?.author && (
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {(data.author.name || data.author.email).charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {data.author.name || data.author.email}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                data?.published 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                                {data?.published ? 'Published' : 'Draft'}
                            </span>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                saveStatus === 'saved' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                saveStatus === 'saving' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                saveStatus === 'unsaved' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                                {saveStatus === 'saved' ? 'Saved' :
                                 saveStatus === 'saving' ? 'Saving...' :
                                 saveStatus === 'unsaved' ? 'Unsaved' :
                                 'Error'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div className="flex items-center gap-1">
                        <span>Last updated: {data?.updatedAt ? new Date(data.updatedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        }) : 'Unknown'}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl">
                <article className="prose prose-base max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-h1:text-xl prose-h1:font-semibold prose-h2:text-lg prose-h2:font-semibold prose-h3:text-base prose-h3:font-semibold">
                <EditorRoot>
                    <EditorContent
                        key={slug}
                        initialContent={initialContent || undefined}
                        extensions={defaultExtensions}
                        className="relative min-h-[600px] w-full transition-all duration-200 "
                        editorProps={{
                            handleDOMEvents: {
                                keydown: (_view, event) => handleCommandNavigation(event),
                            },
                            attributes: {
                                    class: "py-12 prose prose-base dark:prose-invert focus:outline-none max-w-full min-h-[500px] prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-sm prose-p:leading-relaxed prose-p:mb-3 "
                            },
                            
                        }}
                        onUpdate={({ editor }) => {
                            if (initialLoadRef.current) return;

                            const content = editor.getJSON()
                            setInitialContent(content)
                            
                            if (data?.title) {
                                debounceAutoSave(content, data.title)
                            }
                        }}
                        onCreate={({ editor }) => {
                            setTimeout(() => {
                                initialLoadRef.current = false
                                editor.commands.focus('end')
                            }, 100)
                        }}

                    >
                        
                        <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto bg-white dark:bg-gray-900 px-1 py-2  transition-all">
                            <EditorCommandEmpty className="px-2 text-gray-500 dark:text-gray-400">No results</EditorCommandEmpty>
                            <EditorCommandList>
                                {suggestionItems.map((item) => (
                                    <EditorCommandItem
                                        value={item.title}
                                        onCommand={(val) => item.command && item.command(val)}
                                        className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 aria-selected:bg-blue-50 dark:aria-selected:bg-blue-900 cursor-pointer transition-colors"
                                        key={item.title}
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center bg-white dark:bg-gray-800">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                                        </div>
                                    </EditorCommandItem>
                                ))}
                            </EditorCommandList>
                        </EditorCommand>
                        <EditorBubble
                        tippyOptions={{
                            placement: "bottom-start",
                        }}
                        
                        className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-muted bg-background shadow-md">
                            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
                        </EditorBubble>
                    </EditorContent>
                </EditorRoot>
                </article>
            </div>
        </div>
    )
}