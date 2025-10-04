import type { JSONContent } from "@tiptap/core";

export type Author = {
  id: string;
  name: string | null;
  email: string;
};

export type AuthorInfo = {
  id?: string;
  name?: string | null;
  email?: string;
} | null;

export type User = {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserInfo = {
  id: string;
  name: string;
  email: string;
};

export type CurrentPage = {
  slug: string;
  title: string;
  content: JSONContent;
  excerpt?: string | null;
  tags?: string[];
  frontmatter?: Record<string, unknown>;
  updatedAt?: string;
  author?: AuthorInfo;
};

export type DatabasePage = {
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
  author?: Author;
};

export type PageFrontmatter = {
  title?: string;
  description?: string;
  tags?: string[];
  created?: string;
  updated?: string;
  status?: "draft" | "published";
  author?: string;
};

export type ApiPageResponse = {
  slug?: string;
  title?: string;
  content?: JSONContent;
  excerpt?: string | null;
  tags?: string[];
  published?: boolean;
  updatedAt?: string | Date;
  frontmatter?: Record<string, unknown>;
  author?: Author | null;
};

export type ApiResponse = {
  success?: boolean;
  page?: DatabasePage;
  error?: string;
};

export type PagePayload = {
  title?: string;
  content?: JSONContent;
  tags?: string[];
  published?: boolean;
  excerpt?: string;
};

export type PageContextType = {
  page: CurrentPage | null;
  loading: boolean;
  tocItems: import("@/lib/toc").TocItem[];
  saving: boolean;
  setSaving: (saving: boolean) => void;
  requestSave: (
    title?: string,
    tags?: string[],
  ) => Promise<{ newSlug?: string } | void>;
  setSaveHandler: (
    handler:
      | ((
          title?: string,
          tags?: string[],
        ) => Promise<{ newSlug?: string } | void>)
      | null,
  ) => void;
  updateTocFromContent: (content: JSONContent) => void;
  syncCurrentPage: (updates: Partial<CurrentPage>) => void;
  clearPageCache: () => void;
};

export type PageProviderProps = {
  children: React.ReactNode;
  slug?: string;
  initialPage?: CurrentPage | null;
  initialToc?: import("@/lib/toc").TocItem[];
};

export interface BasePage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags: string[];
  created?: string;
  updated?: string;
  published: boolean;
}

export interface Page extends BasePage {
  frontmatter?: PageFrontmatter;
}

export interface PageSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  author?: Author;
}
