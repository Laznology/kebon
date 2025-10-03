"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { generateTocFromContent } from "@/lib/generateToc";
import { type TocItem } from "@/lib/toc";
import type { JSONContent } from "@tiptap/core";
import type {
  CurrentPage,
  PageContextType,
  PageProviderProps,
  ApiPageResponse,
} from "@/types/page";

const PageContext = createContext<PageContextType | undefined>(undefined);

function normalizeApiResponse(
  data: ApiPageResponse,
  slug: string,
): CurrentPage {
  const title = data.title || slug.replace(/-/g, " ");
  const content = data.content || {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: title }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Start writing your content here..." }],
      },
    ],
  };

  const updatedAt = typeof data.updatedAt === "string"
    ? data.updatedAt
    : data.updatedAt instanceof Date
    ? data.updatedAt.toISOString()
    : new Date().toISOString();

  return {
    slug: data.slug || slug,
    title,
    content,
    excerpt: data.excerpt || null,
    tags: data.tags || [],
    frontmatter: {
      title,
      description: data.excerpt,
      tags: data.tags || [],
      status: data.published ? "published" : "draft",
      updatedAt,
    },
    updatedAt,
    author: data.author ? {
      id: data.author.id,
      name: data.author.name,
      email: data.author.email,
    } : null,
  };
}

export function PageProvider({
  children,
  slug: slugProp,
  initialPage,
  initialToc,
}: PageProviderProps) {
  const pathname = usePathname();
  const slug = slugProp || pathname.split("/").filter(Boolean).pop() || "index";

  const pageCache = useRef<Map<string, CurrentPage>>(new Map());
  const tocCache = useRef<Map<string, TocItem[]>>(new Map());

  const [page, setPage] = useState<CurrentPage | null>(initialPage || null);
  const [loading, setLoading] = useState<boolean>(!initialPage);
  const [tocItems, setTocItems] = useState<TocItem[]>(
    initialToc || (initialPage?.content ? generateTocFromContent(initialPage.content) : [])
  );
  const [saving, setSaving] = useState<boolean>(false);

  const saveHandlerRef = useRef<(title?: string, tags?: string[]) => Promise<{ newSlug?: string } | void>>(() => Promise.resolve());

  const computedTocItems = useMemo(() => {
    if (!page?.content) return [];
    return generateTocFromContent(page.content);
  }, [page?.content]);

  useEffect(() => {
    setTocItems(computedTocItems);
  }, [computedTocItems]);

  useEffect(() => {
    if (slug && page) {
      pageCache.current.set(slug, page);
      tocCache.current.set(slug, tocItems);
    }
  }, [slug, page, tocItems]);

  const setSaveHandler = useCallback((handler: ((title?: string, tags?: string[]) => Promise<{ newSlug?: string } | void>) | null) => {
    saveHandlerRef.current = handler ?? (() => Promise.resolve());
  }, []);

  const requestSave = useCallback((title?: string, tags?: string[]) => {
    return saveHandlerRef.current(title, tags);
  }, []);

  const updateTocFromContent = useCallback(
    (content: JSONContent) => {
      const newTocItems = generateTocFromContent(content);
      setTocItems(newTocItems);
      if (slug) {
        tocCache.current.set(slug, newTocItems);
      }
    },
    [slug],
  );

  const syncCurrentPage = useCallback(
    (updates: Partial<CurrentPage>) => {
      if (!slug || !page) return;

      const hasChanges = Object.keys(updates).some(key => {
        const updateValue = updates[key as keyof CurrentPage];
        const currentValue = page[key as keyof CurrentPage];
        return JSON.stringify(updateValue) !== JSON.stringify(currentValue);
      });

      if (!hasChanges) return;

      const updatedPage: CurrentPage = {
        ...page,
        ...updates,
        frontmatter: {
          ...(page.frontmatter || {}),
          ...(updates.frontmatter || {}),
        },
      };

      setPage(updatedPage);

      if (updates.slug && updates.slug !== slug) {
        pageCache.current.delete(slug);
        pageCache.current.set(updates.slug, updatedPage);
        if (tocItems.length > 0) {
          tocCache.current.delete(slug);
          tocCache.current.set(updates.slug, tocItems);
        }
      }

      if (updates.content) {
        updateTocFromContent(updates.content);
      }
    },
    [page, slug, updateTocFromContent, tocItems],
  );

  const clearPageCache = useCallback(() => {
    pageCache.current.clear();
    tocCache.current.clear();
  }, []);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const cachedPage = pageCache.current.get(slug);
    const cachedToc = tocCache.current.get(slug);

    if (cachedPage) {
      setPage(cachedPage);
      if (cachedToc) setTocItems(cachedToc);
      setLoading(false);
      return;
    }

    if (initialPage && initialPage.slug === slug) {
      setPage(initialPage);
      if (initialToc) setTocItems(initialToc);
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchPage = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/pages/${slug}`);
        if (!response.ok) {
          if (!isCancelled) {
            setPage(null);
            setTocItems([]);
          }
          return;
        }

        const data = await response.json();
        if (!isCancelled) {
          const normalizedPage = normalizeApiResponse(data, slug);
          setPage(normalizedPage);
          setTocItems(generateTocFromContent(normalizedPage.content));
        }
      } catch {
        if (!isCancelled) {
          setPage(null);
          setTocItems([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      isCancelled = true;
    };
  }, [slug, initialPage, initialToc]);

  const contextValue = useMemo<PageContextType>(
    () => ({
      page,
      loading,
      tocItems,
      saving,
      setSaving,
      requestSave,
      setSaveHandler,
      updateTocFromContent,
      syncCurrentPage,
      clearPageCache,
    }),
    [
      page,
      loading,
      tocItems,
      saving,
      requestSave,
      setSaveHandler,
      updateTocFromContent,
      syncCurrentPage,
      clearPageCache,
    ],
  );

  return (
    <PageContext.Provider value={contextValue}>{children}</PageContext.Provider>
  );
}

export function usePage() {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("usePage must be used within a PageProvider");
  }
  return context;
}
