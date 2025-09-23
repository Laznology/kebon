"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Highlight } from "@tiptap/extension-highlight";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { CharacterCount } from "@tiptap/extension-character-count";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import DragHandle from "@tiptap/extension-drag-handle-react";
import { NodeRange } from "@tiptap/extension-node-range";
import { cx } from "class-variance-authority";
import { common, createLowlight } from "lowlight";
import { BackgroundColor } from "@tiptap/extension-text-style";
import type { JSONContent } from "@tiptap/core";

import { CustomHeading } from "@/lib/custom-heading";
import { usePage } from "@/app/[slug]/page-provider";

import { NodeSelector } from "@/components/editor/bubble/node-selector";
import { TextButtons } from "@/components/editor/bubble/text-buttons";
import { ColorSelector } from "@/components/editor/bubble/color-selector";
import { LinkSelector } from "@/components/editor/bubble/link-selector";
import { slashCommand } from "./slash-command";
import { notifications } from "@mantine/notifications";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

type EditorProps = {
  className?: string;
  slug?: string;
  initialContent?: JSONContent;
  title?: string;
};

export default function Editor({
  className,
  slug,
  initialContent,
  title,
}: EditorProps) {
  const { setSaving, setSaveHandler } = usePage();
  const [openNode, setOpenNode] = useState<boolean>(false);
  const [openColor, setOpenColor] = useState<boolean>(false);
  const [openLink, setOpenLink] = useState<boolean>(false);
  const [showBubbleMenu, setShowBubbleMenu] = useState<boolean>(false);
  const [bubbleMenuPosition, setBubbleMenuPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  const [content, setContent] = useState<JSONContent | null>(
    initialContent || null,
  );
  const [lastSavedContent, setLastSavedContent] = useState<JSONContent | null>(
    initialContent || null,
  );

  const debouncedContent = useDebounce(content, 2000);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        slashCommand,
        BackgroundColor.configure({
          types: ["textStyle"],
        }),
        StarterKit.configure({
          heading: false,
          link: false, // Disable link in StarterKit to use custom Link extension
          bulletList: {
            HTMLAttributes: {
              class: cx("list-disc list-outside leading-normal ml-6"),
            },
          },
          orderedList: {
            HTMLAttributes: {
              class: cx("list-decimal list-outside leading-normal ml-6"),
            },
          },
          listItem: {
            HTMLAttributes: {
              class: cx("leading-normal"),
            },
          },
          blockquote: {
            HTMLAttributes: {
              class: cx("border-l-4 border-primary pl-4"),
            },
          },
          codeBlock: false,
          code: {
            HTMLAttributes: {
              class: cx(
                "rounded-md bg-muted px-1.5 py-1 font-mono font-medium text-foreground",
                "dark:bg-slate-700 dark:text-slate-200",
              ),
              spellcheck: "false",
            },
          },
          horizontalRule: false,
          dropcursor: {
            color: "#DBEAFE",
            width: 4,
          },
          gapcursor: false,
          paragraph: {
            HTMLAttributes: {
              class: cx("leading-7"),
            },
          },
        }),
        CustomHeading,
        Placeholder.configure({
          placeholder: 'Ketik "/" untuk command, atau tulis saja',
        }),
        Link.configure({
          HTMLAttributes: {
            class: cx(
              "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
            ),
          },
        }),
        Image.configure({
          allowBase64: true,
          inline: false,
          HTMLAttributes: {
            class: cx("rounded-lg border border-muted max-w-full h-auto"),
          },
        }),
        TaskList.configure({
          HTMLAttributes: {
            class: cx("not-prose pl-2 "),
          },
        }),
        TaskItem.configure({
          HTMLAttributes: {
            class: cx("flex gap-2 items-start"),
          },
          nested: true,
        }),
        HorizontalRule.configure({
          HTMLAttributes: {
            class: cx(
              "mt-4 mb-6 border-t",
              "border-gray-300 dark:border-gray-100",
              "transition-colors duration-200",
            ),
          },
        }),
        Highlight,
        Underline,
        TextStyle,
        Color,
        CharacterCount,
        CodeBlockLowlight.configure({
          lowlight: createLowlight(common),
          HTMLAttributes: {
            class: cx(
              "relative rounded-lg bg-slate-800 border border-slate-600 p-4 my-4 overflow-x-auto",
              "dark:bg-slate-900 dark:border-slate-700",
              "not-prose",
            ),
          },
        }),
        NodeRange,
      ],
      content: initialContent,
      editorProps: {
        attributes: {
          class:
            "py-12 prose prose-base dark:prose-invert focus:outline-none max-w-full min-h-[500px]",
        },
      },
      onUpdate: ({ editor }) => {
        const newContent = editor.getJSON();
        setContent(newContent);
      },
      onSelectionUpdate: ({ editor }) => {
        const { from, to } = editor.state.selection;
        const hasSelection = from !== to;
        setShowBubbleMenu(hasSelection);

        if (hasSelection) {
          const { view } = editor;
          const start = view.coordsAtPos(from);
          const end = view.coordsAtPos(to);
          const centerX = (start.left + end.right) / 2;
          const topY = start.top;
          setBubbleMenuPosition({
            top: topY - 60,
            left: centerX,
          });
        }
      },
    },
    [initialContent],
  );

  const autoSave = useCallback(
    async (contentToSave: JSONContent) => {
      if (!editor || !slug) return;

      setSaving(true);
      try {
        const response = await fetch(`/api/pages/${slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: contentToSave,
            title: title,
          }),
        });

        if (response.ok) {
          setLastSavedContent(contentToSave);
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          console.error("Auto-save failed:", response.status, errorData);
          notifications.show({
            title: "Auto-save Failed",
            message: `Error ${response.status}: ${errorData.error || "There was an error auto-saving the page."}`,
            color: "red",
          });
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
      setSaving(false);
    },
    [editor, slug, title, setSaving],
  );

  useEffect(() => {
    if (!editor || !slug || !debouncedContent) return;

    if (JSON.stringify(debouncedContent) === JSON.stringify(lastSavedContent)) {
      return;
    }

    autoSave(debouncedContent);
  }, [debouncedContent, editor, slug, lastSavedContent, autoSave]);

  const handleSave = useCallback(async () => {
    if (!editor || !slug) return;

    const currentContent = editor.getJSON();
    setSaving(true);
    try {
      const response = await fetch(`/api/pages/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: currentContent,
          title: title,
        }),
      });

      if (response.ok) {
        setLastSavedContent(currentContent);
        notifications.show({
          title: "Saved",
          message: "Page saved successfully.",
          color: "green",
        });
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Manual save failed:", response.status, errorData);
        notifications.show({
          title: "Save Failed",
          message: `Error ${response.status}: ${errorData.error || "There was an error saving the page."}`,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Save failed:", error);
    }
    setSaving(false);
  }, [editor, slug, title, setSaving]);

  useEffect(() => {
    setSaveHandler(() => handleSave);
    return () => setSaveHandler(null);
  }, [handleSave, setSaveHandler]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div
        className={
          className ||
          "relative min-h-[600px] w-full transition-all duration-200"
        }
      >
        <EditorContent editor={editor} />

        {editor && editor.isDestroyed === false && (
          <DragHandle key={`drag-handle-${slug || "default"}`} editor={editor}>
            <div className="drag-handle" />
          </DragHandle>
        )}

        {editor && showBubbleMenu && (
          <div
            className="flex w-fit overflow-visible rounded border border-border bg-[rgb(var(--background))] shadow-xl z-[9999] fixed transform -translate-x-1/2"
            style={{
              top: `${bubbleMenuPosition.top}px`,
              left: `${bubbleMenuPosition.left}px`,
            }}
          >
            <LinkSelector
              open={openLink}
              onOpenChange={setOpenLink}
              editor={editor}
            />
            <NodeSelector
              open={openNode}
              onOpenChange={setOpenNode}
              editor={editor}
            />
            <TextButtons editor={editor} />
            <ColorSelector
              open={openColor}
              onOpenChange={setOpenColor}
              editor={editor}
            />
          </div>
        )}
      </div>
    </div>
  );
}
