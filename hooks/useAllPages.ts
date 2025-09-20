"use client";
import { useState, useEffect } from "react";
import { SearchablePage } from "@/components/search-modal";

export function useAllPages() {
  const [pages, setPages] = useState<SearchablePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPages() {
      try {
        const response = await fetch("/api/pages");
        if (!response.ok) throw new Error("Failed to fetch pages");
        
        const data = await response.json();
        setPages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchPages();
  }, []);

  return { pages, loading, error };
}
