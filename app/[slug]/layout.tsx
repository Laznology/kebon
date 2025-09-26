export const revalidate = 0;
import DocsPageShell from "@/components/docs-page-shell";
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

  const pageData = await getPageBySlug(slug);

  const page = pageData || {
    id: "temp",
    title: slug.replace(/-/g, " "),
    slug,
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: slug.replace(/-/g, " ") }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Start writing your content here..." },
          ],
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
      initialPage={initialPage}
      initialToc={initialToc}
    >
      {children}
    </DocsPageShell>
  );
}
