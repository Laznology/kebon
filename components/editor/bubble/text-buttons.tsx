import { cn } from "@/lib/utils";
import { Editor as TiptapEditor, useEditorState } from "@tiptap/react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
} from "lucide-react";
import type { SelectorItem } from "@/components/editor/bubble/node-selector";
import { Button } from "@/components/ui/button";

interface TextButtonsProps {
  editor?: TiptapEditor | null;
}

export const TextButtons = ({ editor }: TextButtonsProps = {}) => {
  const editorState = useEditorState({
    editor: editor!,
    selector: ({ editor }) => ({
      isBold: editor?.isActive("bold") ?? false,
      isItalic: editor?.isActive("italic") ?? false,
      isUnderline: editor?.isActive("underline") ?? false,
      isStrike: editor?.isActive("strike") ?? false,
      isCode: editor?.isActive("code") ?? false,
    }),
  }) as {
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    isStrike: boolean;
    isCode: boolean;
  };

  if (!editor) return null;

  const items: SelectorItem[] = [
    {
      name: "bold",
      icon: BoldIcon,
      command: (editor) => editor?.chain().focus().toggleBold().run(),
      isActive: () => editorState.isBold,
    },
    {
      name: "italic",
      icon: ItalicIcon,
      command: (editor) => editor?.chain().focus().toggleItalic().run(),
      isActive: () => editorState.isItalic,
    },
    {
      name: "underline",
      icon: UnderlineIcon,
      command: (editor) => editor?.chain().focus().toggleUnderline().run(),
      isActive: () => editorState.isUnderline,
    },
    {
      name: "strike",
      icon: StrikethroughIcon,
      command: (editor) => editor?.chain().focus().toggleStrike().run(),
      isActive: () => editorState.isStrike,
    },
    {
      name: "code",
      icon: CodeIcon,
      command: (editor) => editor?.chain().focus().toggleCode().run(),
      isActive: () => editorState.isCode,
    },
  ];

  return (
    <div className="flex">
      {items.map((item, index) => (
        <Button
          key={index}
          variant="ghost"
          className="rounded-none h-8 px-2 hover:bg-accent"
          onClick={() => item.command(editor)}
        >
          <item.icon
            className={cn("h-3 w-3", { "text-blue": item.isActive(editor) })}
          />
        </Button>
      ))}
    </div>
  );
};
