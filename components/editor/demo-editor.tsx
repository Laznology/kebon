"use client";
import React, { useMemo } from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Highlight } from "@tiptap/extension-highlight";
import { BackgroundColor, TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { CharacterCount } from "@tiptap/extension-character-count";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import DragHandle from "@tiptap/extension-drag-handle-react";
import { NodeRange } from "@tiptap/extension-node-range";
import { cx } from "class-variance-authority";
import { common, createLowlight } from "lowlight";
import type { JSONContent } from "@tiptap/core";
import { TableKit } from "@tiptap/extension-table";

import { CustomHeading } from "@/lib/custom-heading";
import { slashCommand } from "./slash-command";
import { OptimizedBubbleMenu } from "./optimized-bubble-menu";
import { TableContextMenu } from "./table-context-menu";

export type EditorProps = {
  className?: string;
  initialContent?: JSONContent;
};

export default function DemoEditor({
  className,
  initialContent,
}: EditorProps) {
  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      editable: true,
      extensions: [
        TableKit.configure({
          table: {
            resizable: true,
            lastColumnResizable: true,
            allowTableNodeSelection: true,
            HTMLAttributes: {
              class: "border-collapse table-auto w-full my-4",
            },
          },
          tableRow: {
            HTMLAttributes: {
              class: "border-0",
            },
          },
          tableHeader: {
            HTMLAttributes: {
              class:
                "border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-left font-semibold",
            },
          },
          tableCell: {
            HTMLAttributes: {
              class:
                "border border-gray-300 dark:border-gray-600 px-3 py-2 min-w-[100px] relative",
            },
          },
        }),
        slashCommand,
        BackgroundColor.configure({
          types: ["textStyle"],
        }),
        StarterKit.configure({
          heading: false,
          link: false,
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
          placeholder: 'Type "/" for commands, or just start writing',
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
              "border-white",
              "transition-colors duration-200",
            ),
          },
        }),
        Highlight,
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
            "py-4 prose prose-base dark:prose-invert focus:outline-none max-w-full min-h-[500px]",
        },
      },
    },
    [initialContent],
  );
  const editorValue = useMemo(() => ({ editor }), [editor]);

  if (!editor) {
    return null;
  }

  return (
    <EditorContext.Provider value={editorValue}>
      <div className="space-y-3">
        <div
          className={
            className ||
            "relative min-h-[600px] w-full transition-all duration-200"
          }
        >
          {editor && <EditorContent editor={editor} />}

          {editor && !editor.isDestroyed && (
            <div>
              <DragHandle editor={editor}>
                <div className="drag-handle" />
              </DragHandle>
            </div>
          )}

          {editor && (
            <OptimizedBubbleMenu
              editor={editor}
              openNode={false}
              setOpenNode={() => {}}
              openColor={false}
              setOpenColor={() => {}}
              openLink={false}
              setOpenLink={() => {}}
            />
          )}

          {editor && <TableContextMenu editor={editor} />}
        </div>
      </div>
    </EditorContext.Provider>
  );
}
