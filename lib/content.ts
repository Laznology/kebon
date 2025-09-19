import fs from "fs/promises";
import path from "path";
import { JSONContent } from "@tiptap/react";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content", "posts");

export async function readMarkdown(slug: string) {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  const raw = await fs.readFile(filePath, "utf-8");
  const { data: frontmatter, content } = matter(raw);
  return { frontmatter, content };
}

export async function writeMarkdown(slug: string, frontmatter: Record<string, JSONContent>, content: string) {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`)
  const fm = matter.stringify(content, frontmatter)
  await fs.writeFile(filePath, fm, 'utf-8')
}


