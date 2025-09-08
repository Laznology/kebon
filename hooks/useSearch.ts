import { useState, useEffect, useCallback, useMemo } from "react";
import Fuse, { FuseResultMatch, IFuseOptions } from "fuse.js";
import { type Document } from "@/types/document";
import { extractAndCleanText } from "@/lib/extractText";

export type SearchableDocument = {
  id: string;
  title: string;
  slug: string;
  content: string;
};

const fuseOptions: IFuseOptions<SearchableDocument> = {
  keys: [
    { name: "title", weight: 0.7 },
    { name: "content", weight: 0.4 },
  ],
  includeMatches: true,
  threshold: 0.3,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

export function useSearch(documents: Document[] = []) {
  const [query, setQuery] = useState("");

  const searchableDocuments = useMemo(() => {
    return documents.map(
      (doc): SearchableDocument => ({
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        content: doc.content ? extractAndCleanText(doc.content) : "",
      }),
    );
  }, [documents]);

  const fuse = useMemo(() => {
    return new Fuse(searchableDocuments, fuseOptions);
  }, [searchableDocuments]);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const fuseResults = fuse.search(query);

    return fuseResults.map((result) => ({
      item: result.item,
      matches: result.matches || [],
      highlightedTitle: getHighlightedText(
        result.item.title,
        result.matches,
        "title",
      ),
      highlightedContent: getHighlightedText(
        result.item.content,
        result.matches,
        "content",
      ),
    }));
  }, [query, fuse]);

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  return {
    query,
    results,
    clearSearch,
    search,
    hasResults: results.length > 0,
    isSearching: query.trim().length > 0,
  };
}
function getHighlightedText(
  text: string,
  matches: readonly FuseResultMatch[] = [],
  key: string,
): string {
  const match = matches.find((m) => m.key === key);
  if (!match || !match.indices.length) return text;
  const firstMatch = match.indices[0];
  const [start, end] = firstMatch;
  const contextStart = Math.max(0, start - 50);
  const contexEnd = Math.min(text.length, end + 50);

  let snippet = text.substring(contextStart, contexEnd);
  if (contextStart > 0) snippet = "..." + snippet;
  if (contexEnd < text.length) snippet = snippet + "...";

  return snippet;
}
