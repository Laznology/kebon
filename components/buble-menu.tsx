'use client'

import { BubbleMenu, BubbleMenuProps } from '@tiptap/react/menus'

export default function BubbleMenuBar({ editor }: BubbleMenuProps) {
    if (!editor) return null
    return (
        <BubbleMenu editor={editor}  className="flex gap-2 bg-white border rounded-md shadow px-2 py-1">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'font-bold' : ''}>
                B
            </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'italic' : ''}>
                I
            </button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'line-through' : ''}>
                S
            </button>
        </BubbleMenu>
    )
}
