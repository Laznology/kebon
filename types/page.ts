import type { JSONContent } from "@tiptap/core";

export interface BasePage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags: string[];
  created?: string;
  updated?: string;
}

export interface DatabasePage {
  id: string;
  title: string;
  slug: string;
  content: JSONContent | null;
  excerpt: string | null;
  tags: string[];
  published: boolean;
  image: string | null;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  author?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface PageFrontmatter {
  title?: string;
  description?: string;
  tags?: string[];
  created?: string;
  updated?: string;
  status?: "draft" | "published";
  author?: string;
}

export interface Page extends BasePage {
  frontmatter?: PageFrontmatter;
}
