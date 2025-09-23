import DocsPageShell from "@/components/docs-page-shell";
import DocsPageContent from "@/components/docs-page-content";
import { getAllPublishedPages, getPageBySlug } from "@/lib/content";
import { generateTocFromMarkdown } from "@/lib/toc";
import type { CurrentPage } from "@/app/[slug]/page-provider";
import type { Page } from "@/types/page";
import type { Metadata } from "next";
import { extractAndCleanText } from "@/lib/extractText";
import type { JSONContent } from '@tiptap/core';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("index");

  const title = page?.title || "Kebon Docs";
  const description = page?.excerpt || "Documentation home.";

  return { title, description };
}

export default async function Page() {
  const slug = "index";

  const [dbPages, homePage] = await Promise.all([
    getAllPublishedPages(),
    getPageBySlug("index"),
  ]);

  const pages: Page[] = dbPages.map(dbPage => ({
    id: dbPage.id,
    slug: dbPage.slug,
    title: dbPage.title,
    content: extractAndCleanText(dbPage.content as JSONContent),
    excerpt: dbPage.excerpt || undefined,
    tags: dbPage.tags || [],
    created: dbPage.createdAt.toISOString().split('T')[0],
    updated: dbPage.updatedAt.toISOString().split('T')[0],
    frontmatter: {
      title: dbPage.title,
      description: dbPage.excerpt || undefined,
      tags: dbPage.tags || [],
      created: dbPage.createdAt.toISOString().split('T')[0],
      updated: dbPage.updatedAt.toISOString().split('T')[0],
      status: dbPage.published ? 'published' : 'draft',
      author: dbPage.author?.name || undefined,
    },
  }));

  const home = homePage || {
    id: "temp",
    title: "Home",
    slug: "index",
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Home' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Start writing your content here...' }],
        },
      ],
    } as JSONContent,
    excerpt: "Start writing your content here...",
    tags: [],
    published: true,
    image: null,
    authorId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  };

  const markdownContent = extractAndCleanText(home.content as JSONContent);
  
  const initialPage: CurrentPage = {
    slug,
    title: home.title,
    content: markdownContent,
    frontmatter: {
      title: home.title,
      updatedAt: home.updatedAt.toISOString(),
    },
    updatedAt: home.updatedAt.toISOString(),
  };

  const initialToc = generateTocFromMarkdown(markdownContent);

  return (
    <DocsPageShell
      slug={slug}
      pages={pages}
      initialPage={initialPage}
      initialToc={initialToc}
    >
      <DocsPageContent />
    </DocsPageShell>
  );
}
