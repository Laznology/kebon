import DocsPageShell from "@/components/docs-page-shell";
import { generateTocFromMarkdown } from "@/lib/toc";
import { readAllPages, readMarkdown, resolveUpdatedAt } from "@/lib/content";
import type { CurrentPage } from "@/app/[slug]/page-provider";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await readMarkdown(slug).catch(() => null);
  const title =
    typeof page?.frontmatter.title === "string"
      ? page.frontmatter.title
      : slug.replace(/-/g, "");
  const description =
    typeof page?.frontmatter.description === "string"
      ? page.frontmatter.description
      : `${title}`;
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

  const [pages, pageData] = await Promise.all([
    readAllPages(),
    readMarkdown(slug).catch(() => ({
      frontmatter: { title: slug.replace(/-/g, " ") },
      content: `# ${slug.replace(/-/g, " ")}\n\nStart writing your content here...`,
    })),
  ]);

  const updatedAtValue =
    resolveUpdatedAt((pageData.frontmatter ?? {}) as Record<string, unknown>) ??
    new Date().toISOString();

  const initialPage: CurrentPage = {
    slug,
    title:
      typeof pageData.frontmatter?.title === "string"
        ? pageData.frontmatter.title
        : slug.replace(/-/g, " "),
    content: pageData.content,
    frontmatter: pageData.frontmatter,
    updatedAt: updatedAtValue,
  };

  const initialToc = generateTocFromMarkdown(pageData.content);

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
