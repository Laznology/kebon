"use client";

import { Document } from "@/types/document";
import { generateTocFromContent } from "@/lib/generateToc";
import { JSONContent } from "novel";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";

type TocItem = {
  id: string;
  value: string;
  depth: number;
};

type DocumentContextType = {
  document: Document | null;
  initialContent: JSONContent | null;
  tocItems: TocItem[];
  loading: boolean;
  saveStatus: string;
  fetchDocument: (slug: string) => Promise<void>;
  updateContent: (content: JSONContent) => void;
};

const DocumentContext = createContext<DocumentContextType | undefined>(
  undefined,
);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [document, setDocument] = useState<Document | null>(null);
  const [initialContent, setInitialContent] = useState<JSONContent | null>(
    null,
  );
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<string>("saved");

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>("");

  const fetchDocument = useCallback(
    async (slug: string) => {
      if (document?.slug === slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/pages/${slug}`);
        if (!response.ok) throw new Error("Failed to fetch");

        const jsonDoc = await response.json();
        setDocument(jsonDoc);
        const generatedToc = generateTocFromContent(jsonDoc.content);
        setTocItems(generatedToc);
        setInitialContent(jsonDoc.content || null);
        lastContentRef.current = JSON.stringify(jsonDoc.content);
        setSaveStatus("saved");
      } catch (error) {
        console.error("Error fetching data", error);
        setDocument(null);
        setInitialContent(null);
      } finally {
        setLoading(false);
      }
    },
    [document?.slug],
  );

  const autoSave = useCallback(
    async (content: JSONContent) => {
      if (!document) return;
      const contentString = JSON.stringify(content);

      if (contentString === lastContentRef.current) return;

      setSaveStatus("saving");
      try {
        const response = await fetch(`/api/pages/${document.slug}`, {
          method: "PUT",
          body: JSON.stringify({ title: document.title, content }),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to save");
        lastContentRef.current = contentString;
        setSaveStatus("saved");
      } catch (error) {
        console.error("Auto-save Error", error);
        setSaveStatus("error");
      }
    },
    [document],
  );

  const updateContent = useCallback(
    (content: JSONContent) => {
      setInitialContent(content);
      const newToc = generateTocFromContent(content);
      setTocItems(newToc);
      setSaveStatus("unsaved");

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        autoSave(content);
      }, 2000);
    },
    [autoSave],
  );

  const value = {
    document,
    initialContent,
    tocItems,
    loading,
    saveStatus,
    fetchDocument,
    updateContent,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
}
