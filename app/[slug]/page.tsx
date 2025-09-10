"use client";

import Editor from "@/components/editor/Editor";
import { useDocument } from "./document-provider";
import { useEffect, useRef, use } from "react";

export default function EditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { initialContent, loading, fetchDocument, updateContent } =
    useDocument();
  const initialLoadRef = useRef(true);
  const resolvedParams = use(params);

  useEffect(() => {
    fetchDocument(resolvedParams.slug).then(() => {
      initialLoadRef.current = false;
    });
  }, [resolvedParams.slug, fetchDocument]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
          <span className="text-lg text-muted-foreground">
            Loading content...
          </span>
        </div>
      </div>
    );
  }

  if (initialContent) {
    return (
      <div className="rounded-xl">
        <article>
          <Editor
            key={resolvedParams.slug}
            initialContent={initialContent}
            className="relative min-h-[600px] w-full"
            onUpdate={({ editor }) => {
              if (initialLoadRef.current) return;
              updateContent(editor.getJSON());
            }}
          />
        </article>
      </div>
    );
  }

  return <div>Document not found or failed to load.</div>;
}
