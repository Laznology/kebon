export const revalidate = 0;
import PageShell from "@/components/page-shell";
import PageContent from "@/components/page-content";
import { getPageBySlug } from "@/lib/content";
import { generateTocFromContent } from "@/lib/generateToc";
import type { CurrentPage } from "@/types/page";
import type { JSONContent } from "@tiptap/core";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  const page = await getPageBySlug("index");
  return {
    title: page?.title || "Home",
    description: page?.excerpt || "Start writing your documentation here.",
  };
}

export default async function HomePage() {
  const homePage = await getPageBySlug("index");
  
  if (!homePage) {
    notFound();
  }

  const content = homePage.content as JSONContent || { type: "doc", content: [] };
  const initialPage: CurrentPage = {
    slug: "index",
    title: homePage.title,
    content,
    excerpt: homePage.excerpt,
    tags: homePage.tags,
    frontmatter: {
      title: homePage.title,
      updatedAt: homePage.updatedAt.toISOString(),
    },
    updatedAt: homePage.updatedAt.toISOString(),
  };

  const initialToc = generateTocFromContent(content);

  return (
    <PageShell slug="index" initialPage={initialPage} initialToc={initialToc}>
      <PageContent />
    </PageShell>
  );
}
