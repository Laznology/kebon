"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";

type CurrentPage = {
  slug: string;
  title: string;
  content: string;
  frontmatter: Record<string, string>;
  updatedAt?: string;
  author?: { name: string; email: string };
};

type TocItem = {
  id: string;
  value: string;
  depth: number;
};

type PageContextType = {
  page: CurrentPage | null;
  loading: boolean;
  tocItems: TocItem[];
};

const PageContext = createContext<PageContextType | undefined>(undefined);

function generateTocFromMarkdown(markdown: string): TocItem[] {
  const lines = markdown.split('\n');
  const tocItems: TocItem[] = [];
  
  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const depth = match[1].length;
      const value = match[2].trim();
      const id = value.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      tocItems.push({
        id,
        value,
        depth,
      });
    }
  });
  
  return tocItems;
}

export function PageProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<CurrentPage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const slug = pathname.split("/").pop();
    if (!slug) return;

    const fetchPage = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/pages/${slug}`);
        if (!response.ok) {
          setPage({
            slug,
            title: slug.replace(/-/g, " "),
            content: `# ${slug.replace(/-/g, " ")}\n\nStart writing your content here...`,
            frontmatter: { title: slug.replace(/-/g, " ") },
          });
          setTocItems([]);
          return;
        }

        const data = await response.json();
        setPage(data);
        
        if (data.content) {
          const toc = generateTocFromMarkdown(data.content);
          setTocItems(toc);
        }
      } catch (error) {
        console.error("Error fetching page:", error);
        setPage(null);
        setTocItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [pathname]);

  const value: PageContextType = {
    page,
    loading,
    tocItems,
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const ctx = useContext(PageContext);
  if (!ctx) {
    throw new Error("usePage must be used within a PageProvider");
  }
  return ctx;
}
