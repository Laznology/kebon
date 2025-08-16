import { Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {Input} from "@/components/ui/input"
import {useRef, useEffect} from "react";
import {useEditor} from "novel";

export function isValidUrl(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

export function getUrlFromString(str: string){
    if (isValidUrl(str)) return str
    try {
        if (str.includes(".") && str.includes(" ")) {
            return new URL(`https://${str}`).toString()
        }
    } catch {
        return null
    }
}

interface LinkSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const LinkSelector = ({open, onOpenChange }: LinkSelectorProps) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const { editor } = useEditor()

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    })

    if (!editor) return null

    return (
        <Popover modal={true} open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant={"ghost"}
                    className={"gap-2 rounded-none border-none"}
                >
                <p className={"text-base"}>↗</p>
                    <p className={cn("underline decoration-stone-400 underline-offset-4",
                        {"text-blue-400" : editor.isActive("link")})}></p>
                </Button>
            </PopoverTrigger>
            <PopoverContent align={"start"} className={"w-60 p-0"} alignOffset={10}>
                <form onSubmit={e => {
                    const target = e.currentTarget as HTMLFormElement
                    e.preventDefault()
                    const input = target[0] as HTMLInputElement
                    const url = getUrlFromString(input.value)
                    if (url) {editor?.chain().focus().setLink({ href: url }).run()}
                }}
                    className={"flex p-1"}
                >
                <Input
                    ref={inputRef}
                    type='text'
                    placeholder='Paste a link'
                    className='flex-1 bg-background p-1 text-sm outline-none'
                    defaultValue={editor.getAttributes("link").href}
                />
                    {editor.getAttributes("link").href ? (
                        <Button
                            size={"icon"}
                            variant={"outline"}
                            type={"button"}
                            className={"flex h-8 items-center rounded-sm p-1 text-red-600 transition-all hover:bg-red-100 dark:hover:bg-red-800"}
                            onClick={() => {
                                editor?.chain().focus().unsetLink().run()
                            }}
                        >
                            <Trash2 size={4} />
                        </Button>
                    ) : (
                        <Button size={"icon"} className={"h-8 aspect-square"}>
                            <Check size={4} />
                        </Button>
                    )}
                </form>
            </PopoverContent>
        </Popover>
    )
}