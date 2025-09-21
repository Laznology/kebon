import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import type { Page } from "@/types/page";

const CONTENT_DIR = path.join(process.cwd(), "content", "posts");

export async function readMarkdown(slug: string) {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  const raw = await fs.readFile(filePath, "utf-8");
  const { data: frontmatter, content } = matter(raw);
  return { frontmatter, content };
}

export async function writeMarkdown(slug: string, frontmatter: Record<string, unknown>, content: string) {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`)
  const fm = matter.stringify(content, frontmatter)
  await fs.writeFile(filePath, fm, 'utf-8')
}

export async function readHomePage(){
  const filePath = path.join(CONTENT_DIR, 'index.md')
  const raw = await fs.readFile(filePath, 'utf-8')
  const { data: frontmatter, content } = matter(raw)
  return { frontmatter, content }
}

export async function readAllPages(): Promise<Page[]> {
  const files = await fs.readdir(CONTENT_DIR);
  const markdownFiles = files.filter((file) => file.endsWith(".md"));

  const pages = await Promise.all(
    markdownFiles.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      const filePath = path.join(CONTENT_DIR, file);
      const raw = await fs.readFile(filePath, "utf-8");
      const { data: frontmatter, content } = matter(raw);

      const rawStatus =
        typeof frontmatter.status === "string" ? frontmatter.status : undefined;
      const allowedStatuses: Array<"draft" | "published"> = [
        "draft",
        "published",
      ];

      const safeFrontmatter = {
        title: typeof frontmatter.title === "string" ? frontmatter.title : undefined,
        description:
          typeof frontmatter.description === "string"
            ? frontmatter.description
            : undefined,
        tags: Array.isArray(frontmatter.tags)
          ? (frontmatter.tags as string[])
          : undefined,
        created:
          typeof frontmatter.created === "string"
            ? frontmatter.created
            : undefined,
        updated:
          typeof frontmatter.updated === "string"
            ? frontmatter.updated
            : undefined,
        status: allowedStatuses.includes(rawStatus as never)
          ? (rawStatus as "draft" | "published")
          : undefined,
        author:
          typeof frontmatter.author === "string"
            ? frontmatter.author
            : undefined,
      } as Page["frontmatter"];

      const title = safeFrontmatter?.title || slug.replace(/-/g, " ");

      return {
        id: slug,
        slug,
        title,
        content,
        excerpt: content.slice(0, 200),
        tags: safeFrontmatter?.tags ?? [],
        created: safeFrontmatter?.created,
        updated: safeFrontmatter?.updated,
        frontmatter: safeFrontmatter,
      } satisfies Page;
    }),
  );

  return pages.sort((a, b) => a.title.localeCompare(b.title));
}

export function resolveUpdatedAt(frontmatter: Record<string, unknown>): string | undefined {
  if (typeof frontmatter.updatedAt === "string") {
    return frontmatter.updatedAt;
  }

  if (typeof frontmatter.updated === "string") {
    return frontmatter.updated;
  }

  return undefined;
}
