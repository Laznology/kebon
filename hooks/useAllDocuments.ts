// hooks/useAllDocuments.ts
import { Document } from "@/types/document";
import { useEffect, useState } from "react";

let globalDocs: Document[] | null = null;
let lastFetch = 0;
const TTL = 300000;

export function useAllDocuments() {
  const [docs, setDocs] = useState(globalDocs || []);
  const [loading, setLoading] = useState(!globalDocs);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (globalDocs && Date.now() - lastFetch < TTL) {
      setDocs(globalDocs);
      setLoading(false);
      return;
    }

    fetch("/api/pages")
      .then((res) => res.json())
      .then((data) => {
        globalDocs = data;
        lastFetch = Date.now();
        setDocs(data);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        if (globalDocs) setDocs(globalDocs);
      });
  }, []);

  return { documents: docs, loading, error };
}
