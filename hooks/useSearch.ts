import { useState, useEffect, useCallback } from "react";
import type { DatabasePage } from "@/types/page";

export type SearchResult = DatabasePage & {
  searchScore: number;
  highlightedTitle: string;
  highlightedExcerpt: string | null;
};

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
      );
      if (response.ok) {
        const searchResults = await response.json();
        setResults(searchResults);
      } else {
        setResults([]);
      }
    } catch (error) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        search(query);
      } else if (query.trim().length === 0) {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, search]);

  return {
    query,
    results,
    loading,
    clearSearch,
    search,
    setQuery,
    hasResults: results.length > 0,
    isSearching: query.trim().length > 0,
  };
}
