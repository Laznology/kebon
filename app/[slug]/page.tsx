"use client";
import { Document } from "@/types/document";
import { JSONContent } from "novel";
import Editor from "@/components/editor/Editor";
import { useState, useEffect, useRef, useCallback } from "react";
import DocsLayout from "@/components/DocsLayout";
import { TableOfContents } from "@mantine/core";
import { generateTocFromContent } from "@/lib/generateToc";

type saveStatus = "saved" | "saving" | "error" | "unsaved";

type TocItem = {
  id: string;
  value: string;
  depth: number;
};

export default function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [initialContent, setInitialContent] = useState<JSONContent | null>(
    null
  );
  const [data, setData] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<saveStatus>("saved");
  const [slug, setSlug] = useState<string>("");
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>("");
  const initialLoadRef = useRef<boolean>(true);

  const autoSave = useCallback(
    async (content: JSONContent, title: string) => {
      if (!slug || initialLoadRef.current) return;
      const contentString = JSON.stringify(content);

      if (contentString === lastContentRef.current) return;
      try {
        setSaveStatus("saving");
        const response = await fetch(`/api/pages/${slug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save");
        }
        lastContentRef.current = contentString;
        setSaveStatus("saved");
      } catch (error) {
        console.error("Auto-save Error", error);
        setSaveStatus("error");
      }
    },
    [slug]
  );

  const debounceAutoSave = useCallback(
    async (content: JSONContent, title: string) => {
      setSaveStatus("unsaved");
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        autoSave(content, title);
      }, 2000);
    },
    [autoSave]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params;
        const currentSlug = resolvedParams.slug;
        setSlug(currentSlug);
        const response = await fetch(`/api/pages/${currentSlug}`);

        if (!response.ok) throw new Error("Failed to fetch");

        const jsonDoc = await response.json();
        setData(jsonDoc);
        const generatedToc = generateTocFromContent(jsonDoc.content);
        setTocItems(generatedToc);

        let initialContent: JSONContent | undefined;
        if (jsonDoc.content && Array.isArray(jsonDoc.content.blocks)) {
          initialContent = jsonDoc.content.blocks;
        } else if (jsonDoc.content) {
          initialContent = jsonDoc.content;
        } else {
          initialContent = {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [],
              },
            ],
          };
        }

        setInitialContent(initialContent || null);
        if (initialContent) {
          lastContentRef.current = JSON.stringify(initialContent);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
        setTimeout(() => {
          initialLoadRef.current = false;
        }, 100);
      }
    };

    fetchData();
  }, [params]);

  if (loading || !initialContent)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
          <span className="text-lg text-gray-600 dark:text-gray-400">
            Loading editor...
          </span>
        </div>
      </div>
    );

  const ToC = ({ items }: { items: TocItem[] }) => {
    const reinitializeRef = useRef(() => {});

    useEffect(() => {
      const timer = setTimeout(() => {
        reinitializeRef.current();
      }, 500);
      return () => clearTimeout(timer);
    }, [items]);

    if (items.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400 p-4">
          No headings found
        </div>
      );
    }

    return (
      <TableOfContents
        variant="light"
        color="blue"
        size="sm"
        radius="sm"
        reinitializeRef={reinitializeRef}
        initialData={items}
        scrollSpyOptions={{
          selector: "[data-heading-id]",
          getDepth: (element) => Number(element.getAttribute("data-depth")),
          getValue: (element) =>
            element.getAttribute("data-heading-text") || "",
        }}
        getControlProps={({ data, active }) => ({
          onClick: () => {
            const element = document.querySelector(
              `[data-heading-id="${data.id}"]`
            );
            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest",
              });
            }
          },
          style: {
            color: active
              ? "var(--mantine-color-blue-6)"
              : "var(--mantine-color-gray-6)",
            fontWeight: active ? 600 : 400,
          },
          children: data.value,
        })}
      />
    );
  };

  return (
    <DocsLayout toc={<ToC items={tocItems} />}>
      <div className="flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <span className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">
              {data?.title}
            </span>
            {data?.author && (
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {(data.author.name || data.author.email)
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {data.author.name || data.author.email}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  data?.published
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                }`}
              >
                {data?.published ? "Published" : "Draft"}
              </span>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  saveStatus === "saved"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : saveStatus === "saving"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : saveStatus === "unsaved"
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {saveStatus === "saved"
                  ? "Saved"
                  : saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "unsaved"
                  ? "Unsaved"
                  : "Error"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
          <div className="flex items-center gap-1">
            <span>
              Last updated:{" "}
              {data?.updatedAt
                ? new Date(data.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Unknown"}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl">
        <article>
          <Editor
            contentKey={slug}
            initialContent={initialContent}
            className="relative min-h-[600px] w-full transition-all duration-200 "
            onUpdate={({ editor }) => {
              if (initialLoadRef.current) return;

              const content = editor.getJSON();
              setInitialContent(content);

              const newToc = generateTocFromContent(content);
              setTocItems(newToc);

              if (data?.title) {
                debounceAutoSave(content, data.title);
              }
            }}
            onCreate={({ editor }) => {
              setTimeout(() => {
                initialLoadRef.current = false;
                editor.commands.focus("end");
              }, 100);
            }}
          />
        </article>
      </div>
    </DocsLayout>
  );
}
