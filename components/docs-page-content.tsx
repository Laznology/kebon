"use client";

import Editor from "@/components/editor/editor";
import { usePage } from "@/app/[slug]/page-provider";
import type { JSONContent } from "@tiptap/core";

const emptyDocument: JSONContent = {
  type: "doc",
  content: [],
};

export default function DocsPageContent() {
  const { page, loading } = usePage();

  if (loading || !page) {
    return (
      <div className="w-full flex justify-center py-12 text-sm text-muted-foreground">
        Loading content...
      </div>
    );
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
