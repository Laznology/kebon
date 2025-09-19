import {
  Check,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  TextQuote,
  ListOrdered,
  TextIcon,
  Code,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";
import { Editor as TiptapEditor } from "@tiptap/react";

import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";

export type SelectorItem = {
  name: string;
  icon: LucideIcon;
  command: (editor: TiptapEditor | null) => void;
  isActive: (editor: TiptapEditor | null) => boolean;
};

const items: SelectorItem[] = [
  {
    name: "Text",
    icon: TextIcon,
    command: (editor) =>
      editor?.chain().focus().toggleNode("paragraph", "paragraph").run(),
    isActive: (editor) =>
      !editor?.isActive("paragraph") &&
      !editor?.isActive("bulletList") &&
      !editor?.isActive("orderedList"),
  },
  {
    name: "Heading 1",
    icon: Heading1,
    command: (editor) =>
      editor?.chain().focus().setNode("heading", { level: 1 }).run(),
    isActive: (editor) => !!editor?.isActive("heading", { level: 1 }),
  },
  {
    name: "Heading 2",
    icon: Heading2,
    command: (editor) =>
      editor?.chain().focus().setNode("heading", { level: 2 }).run(),
    isActive: (editor) => !!editor?.isActive("heading", { level: 2 }),
  },
  {
    name: "Heading 3",
    icon: Heading3,
    command: (editor) =>
      editor?.chain().focus().setNode("heading", { level: 3 }).run(),
    isActive: (editor) => !!editor?.isActive("heading", { level: 3 }),
  },
  {
    name: "To-do List",
    icon: CheckSquare,
    command: (editor) => editor?.chain().focus().toggleTaskList().run(),
    isActive: (editor) => !!editor?.isActive("taskItem"),
  },
  {
    name: "Bullet List",
    icon: CheckSquare,
    command: (editor) => editor?.chain().focus().toggleBulletList().run(),
    isActive: (editor) => !!editor?.isActive("bulletList"),
  },
  {
    name: "Numbered List",
    icon: ListOrdered,
    command: (editor) => editor?.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => !!editor?.isActive("orderedList"),
  },
  {
    name: "Quote",
    icon: TextQuote,
    command: (editor) => editor?.chain().focus().toggleBlockquote().run(),
    isActive: (editor) => !!editor?.isActive("blockquote"),
  },
  {
    name: "Code",
    icon: Code,
    command: (editor) => editor?.chain().focus().toggleCodeBlock().run(),
    isActive: (editor) => !!editor?.isActive("codeBlock"),
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor?: TiptapEditor | null;
}

export const NodeSelector = ({ open, onOpenChange, editor }: NodeSelectorProps) => {
  if (!editor) return null;
  const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? {
    name: "Multiple",
  };

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 rounded-none border-none hover:bg-accent focus:ring-0 h-8 px-2 text-sm"
        >
          {activeItem.name}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={5}
        align="start"
        className="w-48 p-1 bg-popover border border-border shadow-md z-[9999]"
      >
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              item.command(editor);
              onOpenChange(false);
            }}
            className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-accent"
          >
            <div className="flex items-center space-x-2">
              <div className="rounded-sm border p-1">
                <item.icon className="h-3 w-3" />
              </div>
              <span>{item.name}</span>
            </div>
            {activeItem.name === item.name && <Check className="h-4 w-4" />}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};
