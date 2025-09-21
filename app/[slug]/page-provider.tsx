"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { usePathname } from "next/navigation";
import { generateTocFromMarkdown, type TocItem } from "@/lib/toc";

export type CurrentPage = {
  slug: string;
  title: string;
  content: string;
  frontmatter?: Record<string, unknown>;
  updatedAt?: string;
  author?: { name?: string; email?: string } | null;
};

type PageContextType = {
  page: CurrentPage | null;
  loading: boolean;
  tocItems: TocItem[];
  saving: boolean;
  setSaving: Dispatch<SetStateAction<boolean>>;
  requestSave: () => void;
  setSaveHandler: (handler: (() => void) | null) => void;
};

const PageContext = createContext<PageContextType | undefined>(undefined);

type PageProviderProps = {
  children: ReactNode;
  slug?: string;
  initialPage?: CurrentPage | null;
  initialToc?: TocItem[];
};

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

  const [page, setPage] = useState<CurrentPage | null>(initialPage ?? null);
  const [loading, setLoading] = useState<boolean>(!initialPage);
  const [tocItems, setTocItems] = useState<TocItem[]>(
    initialToc
      ?? (initialPage?.content ? generateTocFromMarkdown(initialPage.content) : []),
  );
  const [saving, setSaving] = useState<boolean>(false);
  const saveHandlerRef = useRef<() => void>(() => {});

  const setSaveHandler = useCallback((handler: (() => void) | null) => {
    saveHandlerRef.current = handler ?? (() => {});
  }, []);

  const requestSave = useCallback(() => {
    saveHandlerRef.current();
  }, []);

  useEffect(() => {
    if (!initialPage) {
      return;
    }

    setPage(initialPage);
    setLoading(false);
    setTocItems(
      initialToc ??
        (initialPage.content ? generateTocFromMarkdown(initialPage.content) : []),
    );
  }, [initialPage, initialToc]);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    if (initialPage && initialPage.slug === slug) {
      return;
    }

    let isCancelled = false;

    const fetchPage = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/pages/${slug}`);
        if (!response.ok) {
          const fallbackTitle = slug.replace(/-/g, " ");
          const fallbackContent = `# ${fallbackTitle}\n\nStart writing your content here...`;

          if (!isCancelled) {
            setPage({
              slug,
              title: fallbackTitle,
              content: fallbackContent,
              frontmatter: { title: fallbackTitle },
            });
            setTocItems(generateTocFromMarkdown(fallbackContent));
          }
          return;
        }

        const data = await response.json();
        if (!isCancelled) {
          setPage(data);
          setTocItems(
            data.content ? generateTocFromMarkdown(data.content) : [],
          );
        }
      } catch (error) {
        console.error("Error fetching page:", error);
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
  }, [slug, initialPage]);

  const value = useMemo<PageContextType>(
    () => ({
      page,
      loading,
      tocItems,
      saving,
      setSaving,
      requestSave,
      setSaveHandler,
    }),
    [loading, page, requestSave, saving, setSaveHandler, setSaving, tocItems],
  );

  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePage() {
  const ctx = useContext(PageContext);
  if (!ctx) {
    throw new Error("usePage must be used within a PageProvider");
  }
  return ctx;
}
