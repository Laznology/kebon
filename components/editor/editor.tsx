"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { AllSelection } from "@tiptap/pm/state";
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
import type { ApiResponse } from "@/types/page";
import { TableKit } from "@tiptap/extension-table";

import { CustomHeading } from "@/lib/custom-heading";
import { usePage } from "@/app/[slug]/page-provider";
import { slashCommand } from "./slash-command";
import { notifications } from "@mantine/notifications";
import { OptimizedBubbleMenu } from "./optimized-bubble-menu";
import { TableContextMenu } from "./table-context-menu";
import { useHotkeys } from "@mantine/hooks";
import { useSession } from "next-auth/react";

export type EditorProps = {
  className?: string;
  slug?: string;
  initialContent?: JSONContent;
  title?: string;
  onUpdate?: (content: JSONContent) => void;
};

const EditorSkeleton = () => (
  <div className="w-full space-y-6 py-12">
    <div className="space-y-3">
      <div className="h-10 w-1/2 rounded-md bg-gray-200 animate-pulse" />
      <div className="h-4 w-full rounded-md bg-gray-200 animate-pulse" />
      <div className="h-4 w-5/6 rounded-md bg-gray-200 animate-pulse" />
    </div>
  </div>
);

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

  useEffect(() => {
    if (debouncedContent) {
      updateTocFromContent(debouncedContent);
    }
  }, [debouncedContent, updateTocFromContent]);
  const { status } = useSession();
  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      editable: status === "authenticated",
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
            "py-12 prose prose-base dark:prose-invert focus:outline-none max-w-full min-h-[500px]",
        },
        handleDOMEvents: {
          keydown: (view, event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
              event.preventDefault();
              const { state, dispatch } = view;
              const { doc } = state;
              const tr = state.tr.setSelection(new AllSelection(doc));
              dispatch(tr);
              return true;
            }
            return false;
          },
        },
      },
      onUpdate: ({ editor }) => {
        const newContent = editor.getJSON();
        setContent(newContent);
      },
    },
    [initialContent],
  );
  const editorValue = useMemo(() => ({ editor }), [editor]);

  const applySaveResult = useCallback(
    (contentToSave: JSONContent, payload: ApiResponse) => {
      setLastSavedContent(contentToSave);

      const updatedPage = payload.page;
      if (!updatedPage) return;

      const updatedAt = typeof updatedPage.updatedAt === "string"
        ? updatedPage.updatedAt
        : updatedPage.updatedAt instanceof Date
        ? updatedPage.updatedAt.toISOString()
        : new Date().toISOString();

      const pageTitle = updatedPage.title || title || currentPage?.title || (slug ? slug.replace(/-/g, " ") : "Untitled");

      const hasSlugChanged = updatedPage.slug !== currentPage?.slug;
      const hasTitleChanged = pageTitle !== currentPage?.title;
      const hasExcerptChanged = updatedPage.excerpt !== currentPage?.excerpt;
      const hasTagsChanged = JSON.stringify(updatedPage.tags) !== JSON.stringify(currentPage?.tags);

      if (hasSlugChanged || hasTitleChanged || hasExcerptChanged || hasTagsChanged) {
        syncCurrentPage({
          slug: updatedPage.slug,
          title: pageTitle,
          updatedAt,
          excerpt: updatedPage.excerpt || currentPage?.excerpt || null,
          tags: updatedPage.tags || currentPage?.tags || [],
          frontmatter: {
            title: pageTitle,
            updatedAt,
            description: updatedPage.excerpt,
            tags: updatedPage.tags || [],
            status: updatedPage.published ? "published" : "draft",
          },
          author: updatedPage.author || currentPage?.author || null,
        });
      }
    },
    [currentPage, syncCurrentPage, title, slug],
  );

  const autoSave = useCallback(
    async (contentToSave: JSONContent) => {
      if (!editor || !slug) return;

      const wasFocused = editor.isFocused;
      const currentSelection = editor.state.selection;

      setSaving(true);
      try {
        const response = await fetch(`/api/pages/${slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: contentToSave,
            title,
            tags: currentPage?.tags,
          }),
        });

        const payload = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));

        if (response.ok) {
          applySaveResult(contentToSave, payload);

          if (wasFocused && editor && !editor.isDestroyed) {
            setTimeout(() => {
              if (editor && !editor.isDestroyed) {
                editor.commands.focus();
                if (currentSelection) {
                  editor.commands.setTextSelection(currentSelection);
                }
              }
            }, 0);
          }
        } else {
          notifications.show({
            title: "Auto-save Failed",
            message: `Error ${response.status}: ${payload?.error || "There was an error auto-saving the page."}`,
            color: "red",
          });
        }
      } catch {
        notifications.show({
          title: "Auto-save failed",
          message: "Error while saving",
        });
      } finally {
        setSaving(false);
      }
    },
    [applySaveResult, editor, slug, title, setSaving, currentPage],
  );

  useEffect(() => {
    if (!editor || !slug || !debouncedContent) return;

    if (JSON.stringify(debouncedContent) === JSON.stringify(lastSavedContent)) {
      return;
    }

    autoSave(debouncedContent);
  }, [debouncedContent, editor, slug, lastSavedContent, autoSave]);

  const handleSave = useCallback(async (editedTitle?: string, editedTags?: string[]) => {
    if (!editor || !slug) return;

    const currentContent = editor.getJSON();

    const wasFocused = editor.isFocused;
    const currentSelection = editor.state.selection;

    setSaving(true);
    try {
      const response = await fetch(`/api/pages/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: currentContent,
          title: editedTitle || title,
          tags: editedTags,
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

        if (wasFocused && editor && !editor.isDestroyed) {
          setTimeout(() => {
            if (editor && !editor.isDestroyed) {
              editor.commands.focus();
              if (currentSelection) {
                editor.commands.setTextSelection(currentSelection);
              }
            }
          }, 0);
        }
        
        return { newSlug: payload?.page?.slug };
      } else {
        notifications.show({
          title: "Save Failed",
          message: `Error ${response.status}: ${payload?.error || "There was an error saving the page."}`,
          color: "red",
        });
      }
    } catch {
      notifications.show({
        title: "Error",
        message: "Error with manual saving",
      });
    } finally {
      setSaving(false);
    }
  }, [applySaveResult, editor, slug, title, setSaving]);

  useEffect(() => {
    setSaveHandler(handleSave);
    return () => setSaveHandler(null);
  }, [handleSave, setSaveHandler]);

  useHotkeys([
    [
      "mod+s",
      (e) => {
        e.preventDefault();
        handleSave();
      },
    ],
  ]);

  useEffect(() => {
    return () => {
      if (editor && !editor.isDestroyed) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="space-y-3">
        <div
          className={
            className ||
            "relative min-h-[600px] w-full transition-all duration-200"
          }
        >
          <EditorSkeleton />
        </div>
      </div>
    );
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
          {editor && (
            <EditorContent editor={editor} />
          )}

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
              openNode={openNode}
              setOpenNode={setOpenNode}
              openColor={openColor}
              setOpenColor={setOpenColor}
              openLink={openLink}
              setOpenLink={setOpenLink}
            />
          )}

          {editor && <TableContextMenu editor={editor} />}
        </div>
      </div>
    </EditorContext.Provider>
  );
}
