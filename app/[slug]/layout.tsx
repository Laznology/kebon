"use client";
import { TableOfContents, Group, Text, Title, Badge } from "@mantine/core";
import DocsLayout from "@/components/DocsLayout";
import { DocumentProvider, useDocument } from "@/app/[slug]/document-provider";
import { useEffect, useRef } from "react";
import { useAllDocuments } from "@/hooks/useAllDocuments";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

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
      minDepthToOffset={0}
      depthOffset={20}
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
  const pathname = usePathname();
  if (!document) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <Group gap={8} mb={6} align="center">
            <Text size="xs" c="dimmed">
              Docs
            </Text>
            <Icon icon="mdi:chevron-right" width={16} height={16} />
            <Text size="xs" c="dimmed" className="font-mono">
              {(pathname || "/").replace(/^\//, "") || "home"}
            </Text>
          </Group>
          <Title order={1} className="leading-tight mb-2">
            {document?.title}
          </Title>
          {document?.author && (
            <Group gap={8} className="mb-2" align="center">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {(document.author.name || document.author.email)
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <Text size="sm" c="dimmed">
                {document.author.name || document.author.email}
              </Text>
            </Group>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[220px]">
          <Group gap={8}>
            <Badge
              color={document?.published ? "green" : "yellow"}
              variant="light"
            >
              {document?.published ? "Published" : "Draft"}
            </Badge>
            <Badge
              color={
                saveStatus === "saved"
                  ? "teal"
                  : saveStatus === "saving"
                    ? "blue"
                    : saveStatus === "unsaved"
                      ? "orange"
                      : "red"
              }
              variant="light"
            >
              {saveStatus === "saved"
                ? "Saved"
                : saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "unsaved"
                    ? "Unsaved"
                    : "Error"}
            </Badge>
          </Group>
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
