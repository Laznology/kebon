export const revalidate = 0;
import DocsPageShell from "@/components/docs-page-shell";
import { generateTocFromContent } from "@/lib/generateToc";
import { getAllPublishedPages, getPageBySlug } from "@/lib/content";
import type { CurrentPage } from "@/types/page";
import type { Page } from "@/types/page";
import { extractAndCleanText } from "@/lib/extractText";
import type { JSONContent } from '@tiptap/core';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  
  const title = page?.title || slug.replace(/-/g, " ");
  const description = page?.excerpt || `${title}`;
  
  return {
    title,
    description,
  };
}
export default async function EditPageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [dbPages, pageData] = await Promise.all([
    getAllPublishedPages(),
    getPageBySlug(slug),
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

  const page = pageData || {
    id: "temp",
    title: slug.replace(/-/g, " "),
    slug,
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: slug.replace(/-/g, " ") }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Start writing your content here...' }],
        },
      ],
    } as JSONContent,
    excerpt: "Start writing your content here...",
    tags: [],
    published: false,
    image: null,
    authorId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  };

  const jsonContent = page.content as JSONContent;

  const initialPage: CurrentPage = {
    slug,
    title: page.title,
    content: jsonContent,
    frontmatter: {
      title: page.title,
      updatedAt: page.updatedAt.toISOString(),
    },
    updatedAt: page.updatedAt.toISOString(),
  };

  const initialToc = generateTocFromContent(jsonContent);

  return (
    <DocsPageShell
      slug={slug}
      pages={pages}
      initialPage={initialPage}
      initialToc={initialToc}
    >
      {children}
    </DocsPageShell>
  );
}
