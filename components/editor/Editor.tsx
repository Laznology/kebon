"use client";
import React, { useState, useEffect } from "react";
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
import { Markdown } from "tiptap-markdown";
import { BackgroundColor } from "@tiptap/extension-text-style";

import { CustomHeading } from "@/lib/custom-heading";
import { usePage } from "@/app/[slug]/page-provider";

import { NodeSelector } from "@/components/editor/bubble/node-selector";
import { TextButtons } from "@/components/editor/bubble/text-buttons";
import { ColorSelector } from "@/components/editor/bubble/color-selector";
import { LinkSelector } from "@/components/editor/bubble/link-selector";
import { slashCommand } from "./slash-command";

type EditorProps = {
  className?: string;
  slug?: string;
  initialMarkdown?: string;
  initialFrontmatter?: Record<string, unknown>;
};

export default function Editor({
  className,
  slug,
  initialMarkdown,
  initialFrontmatter,
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

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        slashCommand,
        BackgroundColor.configure({
          types: ["textStyle"],
        }),
        Markdown.configure({}),
        StarterKit.configure({
          heading: false,
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
          placeholder: "Write something ...",
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
      content: initialMarkdown,
      editorProps: {
        attributes: {
          class:
            "py-12 prose prose-base dark:prose-invert focus:outline-none max-w-full min-h-[500px]",
        },
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
    [initialMarkdown],
  );

  const getMarkdown = React.useCallback(() => {
    // @ts-expect-error - Tiptap markdown extension type is not properly exported
    return editor?.storage.markdown.getMarkdown() as string;
  }, [editor]);

  const handleSave = React.useCallback(async () => {
    if (!editor || !slug) return;
    setSaving(true);
    const md = getMarkdown() ?? "";
    try {
      await fetch(`/api/pages/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontmatter: initialFrontmatter ?? {},
          content: md,
          message: `edit: ${slug}.md via TipTap`,
        }),
      });
    } catch (error) {
      console.error("Save failed:", error);
    }
    setSaving(false);
  }, [editor, getMarkdown, initialFrontmatter, slug, setSaving]);

  useEffect(() => {
    setSaveHandler(() => handleSave);
    return () => setSaveHandler(null);
  }, [handleSave, setSaveHandler]);

  React.useEffect(() => {
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

        {editor && (
          <DragHandle editor={editor}>
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
