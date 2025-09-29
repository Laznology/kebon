export const revalidate = 0;
import DocsPageShell from "@/components/docs-page-shell";
import DocsPageContent from "@/components/docs-page-content";
import { getPageBySlug } from "@/lib/content";
import { generateTocFromContent } from "@/lib/generateToc";
import type { CurrentPage } from "@/types/page";
import type { JSONContent } from "@tiptap/core";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  const page = await getPageBySlug("index");

  const title = page?.title || "Home";
  const description =
    page?.excerpt || "Start writing your documentation here.";

  return { title, description };
}

export default async function HomePage() {
  const slug = "index";

  const homePage = await getPageBySlug("index");
  if (!homePage) {
    notFound();
  }

  const jsonContent = (homePage.content as JSONContent | null) ?? {
    type: 'doc',
    content: [],
  };

  const initialPage: CurrentPage = {
    slug,
    title: homePage.title,
    content: jsonContent,
    frontmatter: {
      title: homePage.title,
      updatedAt: homePage.updatedAt.toISOString(),
    },
    updatedAt: homePage.updatedAt.toISOString(),
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
