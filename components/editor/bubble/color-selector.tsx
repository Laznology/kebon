import { ChevronDown, Check } from "lucide-react";
import { Editor as TiptapEditor } from "@tiptap/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export interface BubbleColorMenuItem {
  name: string;
  color: string;
}

const TEXT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "Default",
    color: "transparent",
  },
  {
    name: "Purple",
    color: "#9333EA",
  },
  {
    name: "Red",
    color: "#E00000",
  },
  {
    name: "Yellow",
    color: "#EAB308",
  },
  {
    name: "Blue",
    color: "#2563EB",
  },
  {
    name: "Green",
    color: "#008A00",
  },
  {
    name: "Orange",
    color: "#FFA500",
  },
  {
    name: "Pink",
    color: "#BA4081",
  },
  {
    name: "Gray",
    color: "#A8A29E",
  },
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "Default",
    color: "transparent",
  },
  {
    name: "Purple",
    color: "#9333EA",
  },
  {
    name: "Red",
    color: "#E00000",
  },
  {
    name: "Yellow",
    color: "#EAB308",
  },
  {
    name: "Blue",
    color: "#2563EB",
  },
  {
    name: "Green",
    color: "#008A00",
  },
  {
    name: "Orange",
    color: "#FFA500",
  },
  {
    name: "Pink",
    color: "#BA4081",
  },
  {
    name: "Gray",
    color: "#A8A29E",
  },
];

interface ColorSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor?: TiptapEditor | null;
}

export const ColorSelector = ({
  open,
  onOpenChange,
  editor,
}: ColorSelectorProps) => {
  if (!editor) return null;

  const hasCustomTextColor = TEXT_COLORS.slice(1).some(({ color }) =>
    editor.isActive("textStyle", { color })
  );
  const activeColorItem = hasCustomTextColor 
    ? TEXT_COLORS.find(({ color }) => editor.isActive("textStyle", { color }))
    : TEXT_COLORS[0];

  const hasCustomBackgroundColor = HIGHLIGHT_COLORS.slice(1).some(({ color }) =>
    editor.isActive("textStyle", { backgroundColor: color })
  );
  const activeBackgroundItem = hasCustomBackgroundColor
    ? HIGHLIGHT_COLORS.find(({ color }) => editor.isActive("textStyle", { backgroundColor: color }))
    : HIGHLIGHT_COLORS[0];

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          className="gap-1 rounded-none h-8 px-2 hover:bg-accent"
          variant="ghost"
        >
          <span
            className="rounded-sm px-1 text-xs"
            style={{
              color: activeColorItem?.name === "Default" ? "rgb(var(--foreground))" : activeColorItem?.color,
              backgroundColor: activeBackgroundItem?.name === "Default" ? "transparent" : activeBackgroundItem?.color,
            }}
          >
            A
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        sideOffset={5}
        className="my-1 flex max-h-80 w-48 flex-col overflow-hidden overflow-y-auto rounded border border-border bg-[rgb(var(--background))] p-1 shadow-xl z-[9999]"
        align="start"
      >
        <div className="flex flex-col">
          <div className="my-1 px-2 text-sm font-semibold text-muted-foreground">
            Color
          </div>
          {TEXT_COLORS.map(({ name, color }, index) => (
            <div
              key={index}
              onClick={() => {
                if (name === "Default") {
                  editor.chain().focus().unsetColor().run();
                } else {
                  editor
                    .chain()
                    .focus()
                    .setColor(color || "")
                    .run();
                }
              }}
              className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <div
                  className="rounded-sm border px-2 py-px font-medium"
                  style={{ 
                    color: name === "Default" ? "rgb(var(--foreground))" : color,
                    backgroundColor: "rgb(var(--background))"
                  }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div className="my-1 px-2 text-sm font-semibold text-muted-foreground">
            Background
          </div>
          {HIGHLIGHT_COLORS.map(({ name, color }, index) => (
            <div
              key={index}
              onClick={() => {
                if (name === "Default") {
                  editor.chain().focus().unsetBackgroundColor().run();
                } else {
                  editor.chain().focus().setBackgroundColor(color).run();
                }
              }}
              className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent"
            >
              <div className="flex items-center gap-2">
                <div
                  className="rounded-sm border px-2 py-px font-medium"
                  style={{ 
                    backgroundColor: name === "Default" ? "transparent" : color,
                    color: "rgb(var(--foreground))"
                  }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
              {editor.isActive("highlight", {}) && (
                <Check className="h-4 w-4" />
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
