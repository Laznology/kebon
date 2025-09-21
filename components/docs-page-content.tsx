"use client";

import Editor from "@/components/editor/editor";
import { usePage } from "@/app/[slug]/page-provider";

export default function DocsPageContent() {
  const { page, loading } = usePage();

  if (loading || !page) {
    return (
      <div className="w-full flex justify-center py-12 text-sm text-muted-foreground">
        Loading content...
      </div>
    );
  }

  return (
    <Editor
      slug={page.slug}
      initialMarkdown={page.content}
      initialFrontmatter={page.frontmatter}
    />
  );
}
