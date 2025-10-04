"use client";
import { useState, useEffect } from "react";
import type { DatabasePage } from "@/types/page";

export function useAllPages() {
  const [pages, setPages] = useState<DatabasePage[]>([]);
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

  const refetch = async () => {
    setLoading(true);
    setError(null);
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
  };

  return { pages, loading, error, refetch };
}
