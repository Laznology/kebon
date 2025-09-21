import DocsPageShell from "@/components/docs-page-shell";
import DocsPageContent from "@/components/docs-page-content";
import {
  readAllPages,
  readHomePage,
  resolveUpdatedAt,
} from "@/lib/content";
import { generateTocFromMarkdown } from "@/lib/toc";
import type { CurrentPage } from "@/app/[slug]/page-provider";

export default async function Page() {
  const slug = "index";

  const [pages, home] = await Promise.all([
    readAllPages(),
    readHomePage().catch(() => ({
      frontmatter: { title: "Home" },
      content: `# Home\n\nStart writing your content here...`,
    })),
  ]);

  const frontmatter = (home.frontmatter ?? {}) as Record<string, unknown>;
  const initialPage: CurrentPage = {
    slug,
    title:
      typeof frontmatter.title === "string" ? frontmatter.title : "Home",
    content: home.content,
    frontmatter,
    updatedAt: resolveUpdatedAt(frontmatter) ?? new Date().toISOString(),
  };

  const initialToc = generateTocFromMarkdown(home.content);

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
