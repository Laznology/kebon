import { JSONContent } from "novel";

export interface BasePage {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  content: JSONContent;
  createdAt: string;
  updatedAt: string;
}

export interface PageAuthor {
  authorId: string | null;
  author?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface PageVersion {
  id: string;
  content: JSONContent | null;
  pagetId: string;
  page: Page;
  createdAt: string;
  updatedAt: string;
}

export interface Page extends BasePage, PageAuthor {
  pageVersion: PageVersion[];
}
