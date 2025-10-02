export const revalidate = 0;
import { notFound } from "next/navigation";
import PageShell from "@/components/page-shell";
import { generateTocFromContent } from "@/lib/generateToc";
import { getPageBySlug } from "@/lib/content";
import type { CurrentPage } from "@/types/page";
import type { JSONContent } from "@tiptap/core";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const title = page.title || slug.replace(/-/g, " ");
  const description = page.excerpt || `${title}`;

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

  const pageData = await getPageBySlug(slug);
  if (!pageData) {
    notFound();
  }

  const jsonContent =
    (pageData.content as JSONContent | null) ?? {
      type: "doc",
      content: [],
    };

  const initialPage: CurrentPage = {
    slug,
    title: pageData.title,
    content: jsonContent,
    frontmatter: {
      title: pageData.title,
      updatedAt: pageData.updatedAt.toISOString(),
    },
    updatedAt: pageData.updatedAt.toISOString(),
  };

  const initialToc = generateTocFromContent(content);

  return (
    <PageShell slug={slug} initialPage={initialPage} initialToc={initialToc}>
      {children}
    </PageShell>
  );
}
