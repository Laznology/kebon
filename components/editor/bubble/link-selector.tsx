import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useRef, useEffect } from "react";
import { Editor as TiptapEditor } from "@tiptap/react";

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getUrlFromString(str: string) {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch {
    return null;
  }
}

interface LinkSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor?: TiptapEditor | null;
}

export const LinkSelector = ({ open, onOpenChange, editor }: LinkSelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  if (!editor) return null;

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          className={"gap-1 rounded-none h-8 px-2 hover:bg-accent"}
        >
          <p className={"text-sm"}>↗</p>
          <p
            className={cn("underline decoration-stone-400 underline-offset-4", {
              "text-blue": editor.isActive("link"),
            })}
          ></p>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={"start"}
        className={"w-60 p-1 bg-[rgb(var(--background))] border  shadow-md"}
        alignOffset={10}
      >
        <form
          onSubmit={(e) => {
            const target = e.currentTarget as HTMLFormElement;
            e.preventDefault();
            const input = target[0] as HTMLInputElement;
            const url = getUrlFromString(input.value);
            if (url) {
              editor?.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={"flex p-1 gap-2 items-center"}
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder="Paste a link"
            className="flex-1 p-1 text-sm focus:outline-none foucs:ring-0 foucs:ring-offset-0"
            defaultValue={editor.getAttributes("link").href}
          />
          {editor.getAttributes("link").href ? (
            <Button
              size={"icon"}
              variant={"outline"}
              type={"button"}
              className={
                "flex h-8 items-center rounded-sm p-1 text-red transition-all hover:bg-red"
              }
              onClick={() => {
                editor?.chain().focus().unsetLink().run();
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
  );
};
