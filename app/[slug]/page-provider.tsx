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
  const fallbackTitle = slug.replace(/-/g, " ");
  const content = (data?.content as JSONContent) ?? {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: fallbackTitle }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Start writing your content here..." }],
      },
    ],
  };

  const updatedAt =
    typeof data?.updatedAt === "string"
      ? data.updatedAt
      : data?.updatedAt
        ? new Date(data.updatedAt).toISOString()
        : undefined;

  const frontmatter: Record<string, unknown> = {
    title: data?.title ?? fallbackTitle,
    description: data?.excerpt ?? undefined,
    tags: data?.tags ?? [],
    status:
      typeof data?.published === "boolean"
        ? data.published
          ? "published"
          : "draft"
        : undefined,
    updatedAt,
    ...(data?.frontmatter ?? {}),
  };

  return {
    slug: data?.slug ?? slug,
    title: data?.title ?? fallbackTitle,
    content,
    frontmatter,
    updatedAt,
    author: data?.author
      ? {
          id: data.author.id,
          name: data.author.name,
          email: data.author.email,
        }
      : null,
  };
}

export function PageProvider({
  children,
  slug: slugProp,
  initialPage,
  initialToc,
}: PageProviderProps) {
  const pathname = usePathname();

  const slug = useMemo(() => {
    if (slugProp) return slugProp;
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (lastSegment) return lastSegment;
    return pathname === "/" ? "index" : undefined;
  }, [pathname, slugProp]);

  const pageCache = useRef<Map<string, CurrentPage>>(new Map());
  const tocCache = useRef<Map<string, TocItem[]>>(new Map());

  const [page, setPage] = useState<CurrentPage | null>(initialPage ?? null);
  const [loading, setLoading] = useState<boolean>(!initialPage);
  const [tocItems, setTocItems] = useState<TocItem[]>(
    initialToc ??
      (initialPage?.content ? generateTocFromContent(initialPage.content) : []),
  );
  const [saving, setSaving] = useState<boolean>(false);

  const saveHandlerRef = useRef<() => void>(() => {});

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

  const setSaveHandler = useCallback((handler: (() => void) | null) => {
    saveHandlerRef.current = handler ?? (() => {});
  }, []);

  const requestSave = useCallback(() => {
    saveHandlerRef.current();
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

      const updatedPage: CurrentPage = {
        ...page,
        ...updates,
        frontmatter: updates.frontmatter
          ? { ...(page.frontmatter ?? {}), ...updates.frontmatter }
          : page.frontmatter,
      };

      setPage(updatedPage);

      if (updates.content) {
        updateTocFromContent(updates.content);
      }
    },
    [page, slug, updateTocFromContent],
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
