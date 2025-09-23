"use client";

import Editor from "@/components/editor/editor";
import { usePage } from "@/app/[slug]/page-provider";
import { useState, useEffect } from "react";
import type { JSONContent } from '@tiptap/core';

interface PageApiResponse {
  id: string;
  title: string;
  slug: string;
  content: JSONContent;
  published: boolean;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export default function DocsPageContent() {
  const { page, loading } = usePage();
  const [pageData, setPageData] = useState<PageApiResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!page?.slug || loading) return;

    const fetchPageData = async () => {
      try {
        const response = await fetch(`/api/pages/${page.slug}`);
        if (response.ok) {
          const data = await response.json();
          setPageData(data);
        }
      } catch (error) {
        console.error("Error fetching page data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPageData();
  }, [page?.slug, loading]);

  if (loading || loadingData || !page) {
    return (
      <div className="w-full flex justify-center py-12 text-sm text-muted-foreground">
        Loading content...
      </div>
    );
  }

  return (
    <Editor
      slug={page.slug}
      initialContent={pageData?.content as JSONContent}
      title={page.title}
    />
  );
}
