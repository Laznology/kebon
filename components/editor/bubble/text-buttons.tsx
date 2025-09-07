import { cn } from "@/lib/utils";
import { EditorBubbleItem, useEditor } from "novel";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
} from "lucide-react";
import type { SelectorItem } from "@/components/editor/bubble/node-selector";
import { Button } from "@/components/ui/button";

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;
  const items: SelectorItem[] = [
    {
      name: "bold",
      icon: BoldIcon,
      command: (editor) => editor?.chain().focus().toggleBold().run(),
      isActive: (editor) => !!editor?.isActive("bold"),
    },
    {
      name: "italic",
      icon: ItalicIcon,
      command: (editor) => editor?.chain().focus().toggleItalic().run(),
      isActive: (editor) => !!editor?.isActive("italic"),
    },
    {
      name: "underline",
      icon: UnderlineIcon,
      command: (editor) => editor?.chain().focus().toggleUnderline().run(),
      isActive: (editor) => !!editor?.isActive("underline"),
    },
    {
      name: "strike",
      icon: StrikethroughIcon,
      command: (editor) => editor?.chain().focus().toggleStrike().run(),
      isActive: (editor) => !!editor?.isActive("strike"),
    },
    {
      name: "code",
      icon: CodeIcon,
      command: (editor) => editor?.chain().focus().toggleCode().run(),
      isActive: (editor) => !!editor?.isActive("code"),
    },
  ];

  return (
    <div className="flex">
      {items.map((item, index) => (
        <EditorBubbleItem
          key={index}
          onSelect={(editor) => {
            item.command(editor);
          }}
        >
          <Button
            variant="ghost"
            className="rounded-none h-8 px-2 hover:bg-accent"
          >
            <item.icon
              className={cn("h-3 w-3", { "text-blue": item.isActive(editor) })}
            />
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};
