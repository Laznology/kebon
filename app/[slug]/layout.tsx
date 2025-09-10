"use client";
import { TableOfContents } from "@mantine/core";
import DocsLayout from "@/components/DocsLayout";
import { DocumentProvider, useDocument } from "@/app/[slug]/document-provider";
import { useEffect, useRef } from "react";
import { useAllDocuments } from "@/hooks/useAllDocuments";

const TocComponent = () => {
  const { tocItems } = useDocument();
  const reinitializeRef = useRef(() => {});

  useEffect(() => {
    const timer = setTimeout(() => {
      reinitializeRef.current();
    }, 500);
    return () => clearTimeout(timer);
  }, [tocItems]);

  if (tocItems.length === 0) {
    return <div className={"text-sm p-4"}>No headings found</div>;
  }
  return (
    <TableOfContents
      variant="light"
      color="blue"
      size="sm"
      radius="sm"
      reinitializeRef={reinitializeRef}
      initialData={tocItems}
      scrollSpyOptions={{
        selector: "[data-heading-id]",
        getDepth: (element) => Number(element.getAttribute("data-depth")),
        getValue: (element) => element.getAttribute("data-heading-text") || "",
      }}
      getControlProps={({ data, active }) => ({
        onClick: () => {
          const element = document.querySelector(
            `[data-heading-id="${data.id}"]`,
          );
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
          }
        },
        style: {
          color: active
            ? "var(--mantine-color-blue-6)"
            : "rgb(var(--muted-foreground))",
          fontWeight: active ? 600 : 400,
        },
        children: data.value,
      })}
    />
  );
};

const DocumentHeader = () => {
  const { document, saveStatus } = useDocument();
  if (!document) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <span
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: "rgb(var(--foreground))" }}
          >
            {document?.title}
          </span>
          {document?.author && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {(document.author.name || document.author.email)
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <span
                className="text-sm"
                style={{ color: "rgb(var(--muted-foreground))" }}
              >
                {document.author.name || document.author.email}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                document?.published ? "status-published" : "status-draft"
              }`}
            >
              {document?.published ? "Published" : "Draft"}
            </span>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                saveStatus === "saved"
                  ? "status-saved"
                  : saveStatus === "saving"
                    ? "status-saving"
                    : saveStatus === "unsaved"
                      ? "status-unsaved"
                      : "status-error"
              }`}
            >
              {saveStatus === "saved"
                ? "Saved"
                : saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "unsaved"
                    ? "Unsaved"
                    : "Error"}
            </div>
          </div>
        </div>
      </div>
      <div
        className="flex items-center gap-4 text-xs pt-4"
        style={{
          color: "rgb(var(--muted-foreground))",
          borderTopColor: "rgb(var(--border))",
          borderTopWidth: "1px",
        }}
      >
        <div className="flex items-center gap-1">
          <span>
            Last updated:{" "}
            {document?.updatedAt
              ? new Date(document.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Unknown"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function EditPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { documents } = useAllDocuments();
  return (
    <DocumentProvider>
      <DocsLayout toc={<TocComponent />} documents={documents}>
        <DocumentHeader />
        {children}
      </DocsLayout>
    </DocumentProvider>
  );
}
