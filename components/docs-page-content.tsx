"use client";

import dynamic from "next/dynamic";
import { usePage } from "@/app/[slug]/page-provider";
import type { JSONContent } from "@tiptap/core";

const EditorSkeleton = () => (
  <div className="w-full space-y-6 py-12">
    <div className="space-y-3">
      <div className="h-10 w-1/2 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="h-4 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="h-4 w-5/6 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
    </div>
  </div>
);

const Editor = dynamic(() => import("@/components/editor/editor"), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

const emptyDocument: JSONContent = {
  type: "doc",
  content: [],
};

export default function DocsPageContent() {
  const { page, loading } = usePage();

  if (loading || !page) {
    return <EditorSkeleton />;
  }

  const initialContent = page.content ?? emptyDocument;

  return (
    <Editor
      key={page.slug}
      slug={page.slug}
      initialContent={initialContent}
      title={page.title}
    />
  );
}
