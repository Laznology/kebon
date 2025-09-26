export const revalidate = 0;
import DocsPageShell from "@/components/docs-page-shell";
import DocsPageContent from "@/components/docs-page-content";
import { getPageBySlug } from "@/lib/content";
import { generateTocFromContent } from "@/lib/generateToc";
import type { CurrentPage } from "@/types/page";
import type { JSONContent } from '@tiptap/core';

export async function generateMetadata() {
  const page = await getPageBySlug("index");

  const title = page?.title || "Kebon Docs";
  const description = page?.excerpt || "Documentation home.";

  return { title, description };
}

export default async function HomePage() {
  const slug = "index";

  const homePage = await getPageBySlug("index");

  const page = homePage || {
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
      initialPage={initialPage}
      initialToc={initialToc}
    >
      <DocsPageContent />
    </DocsPageShell>
  );
}
