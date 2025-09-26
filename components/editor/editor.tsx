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
import type { ApiResponse } from "@/types/page";

import { CustomHeading } from "@/lib/custom-heading";
import { usePage } from "@/app/[slug]/page-provider";

import { NodeSelector } from "@/components/editor/bubble/node-selector";
import { TextButtons } from "@/components/editor/bubble/text-buttons";
import { ColorSelector } from "@/components/editor/bubble/color-selector";
import { LinkSelector } from "@/components/editor/bubble/link-selector";
import { slashCommand } from "./slash-command";
import { notifications } from "@mantine/notifications";
import { BubbleMenu } from "@tiptap/react/menus";


export type EditorProps = {
  className?: string;
  slug?: string;
  initialContent?: JSONContent;
  title?: string;
  onUpdate?: (content: JSONContent) => void;
};

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

export default function Editor({
  className,
  slug,
  initialContent,
  title,
}: EditorProps) {
  const {
    setSaving,
    setSaveHandler,
    updateTocFromContent,
    syncCurrentPage,
    page: currentPage,
  } = usePage();
  const [openNode, setOpenNode] = useState<boolean>(false);
  const [openColor, setOpenColor] = useState<boolean>(false);
  const [openLink, setOpenLink] = useState<boolean>(false);


  const [content, setContent] = useState<JSONContent | null>(
    initialContent || null,
  );
  const [lastSavedContent, setLastSavedContent] = useState<JSONContent | null>(
    initialContent || null,
  );

  useEffect(() => {
    if (initialContent) {
      updateTocFromContent(initialContent);
    }
  }, [initialContent, updateTocFromContent]);

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
        updateTocFromContent(newContent);
      },
    },
    [initialContent],
  );

  const applySaveResult = useCallback(
    (contentToSave: JSONContent, payload: ApiResponse) => {
      setLastSavedContent(contentToSave);

      const updatedPage = payload?.page;
      const updatedAtSource = updatedPage?.updatedAt ?? currentPage?.updatedAt;
      const updatedAt =
        typeof updatedAtSource === "string"
          ? updatedAtSource
          : updatedAtSource instanceof Date
            ? updatedAtSource.toISOString()
            : new Date().toISOString();

      const resolvedTitle =
        updatedPage?.title ??
        title ??
        currentPage?.title ??
        (slug ? slug.replace(/-/g, " ") : "Untitled");

      const frontmatter: Record<string, unknown> = {
        ...(currentPage?.frontmatter ?? {}),
        title: resolvedTitle,
      };

      if (updatedAt) {
        frontmatter.updatedAt = updatedAt;
      }

      if (updatedPage) {
        frontmatter.description = updatedPage.excerpt ?? undefined;
        if (Array.isArray(updatedPage.tags)) {
          frontmatter.tags = updatedPage.tags;
        }
        if (typeof updatedPage.published === "boolean") {
          frontmatter.status = updatedPage.published ? "published" : "draft";
        }
      }

      syncCurrentPage({
        content: contentToSave,
        title: resolvedTitle,
        updatedAt,
        frontmatter,
        author: updatedPage?.author ?? currentPage?.author ?? null,
      });
    },
    [currentPage, syncCurrentPage, title, slug],
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
            title,
          }),
        });

        const payload = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));

        if (response.ok) {
          applySaveResult(contentToSave, payload);
        } else {
          console.error("Auto-save failed:", response.status, payload);
          notifications.show({
            title: "Auto-save Failed",
            message: `Error ${response.status}: ${payload?.error || "There was an error auto-saving the page."}`,
            color: "red",
          });
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setSaving(false);
      }
    },
    [applySaveResult, editor, slug, title, setSaving],
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

      const payload = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));

      if (response.ok) {
        applySaveResult(currentContent, payload);
        notifications.show({
          title: "Saved",
          message: "Page saved successfully.",
          color: "green",
        });
      } else {
        console.error("Manual save failed:", response.status, payload);
        notifications.show({
          title: "Save Failed",
          message: `Error ${response.status}: ${payload?.error || "There was an error saving the page."}`,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  }, [applySaveResult, editor, slug, title, setSaving]);

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

  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3" key={`editor-wrapper-${slug}`}>
      <div
        className={
          className ||
          "relative min-h-[600px] w-full transition-all duration-200"
        }
      >
        {editor && (
          <EditorContent editor={editor} key={`editor-content-${slug}`} />
        )}

        {editor && !editor.isDestroyed && (
          <div key={`drag-handle-wrapper-${slug}`}>
            <DragHandle editor={editor}>
              <div className="drag-handle" />
            </DragHandle>
          </div>
        )}

        {editor && (
          <BubbleMenu editor={editor} options={{ placement: 'bottom', flip: false, shift: true, offset: 8, strategy: 'absolute'}} >
            <div className="flex rounded border border-border bg-[rgb(var(--background))] shadow-xl">
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
          </BubbleMenu>
        )}
      </div>
    </div>
  );
}
