"use client";
import { Group, Text } from "@mantine/core";
import DocsLayout from "@/components/docs-layout";
import { PageProvider, usePage } from "@/app/[slug]/page-provider";
import { useEffect, useRef } from "react";
import { useAllPages } from "@/hooks/useAllPages";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { TableOfContents } from "@/components/TableOfContents";

const TocComponent = () => {
  const { tocItems } = usePage();
  const reinitializeRef = useRef(() => {});

  useEffect(() => {
    const timer = setTimeout(() => {
      reinitializeRef.current();
    }, 500);
    return () => clearTimeout(timer);
  }, [tocItems]);

  return (
    <TableOfContents 
      tocItems={tocItems} 
      reinitializeRef={reinitializeRef}
    />
  );
};

const PageHeader = () => {
  const { page, loading } = usePage();
  const pathname = usePathname();

  const slug = pathname.split("/").pop();

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
        </div>
      </div>
    );
  }

  const title = page?.frontmatter?.title || page?.title || slug?.replace(/-/g, " ") || "Untitled";
  const tags = page?.frontmatter?.tags || [];

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <Group gap={8} mb={6} align="center">
            <Text size="xs" c="dimmed">
              Page
            </Text>
            <Icon icon="mdi:chevron-right" width={16} height={16} />
            <Text size="xs" c="dimmed">
              {slug}
            </Text>
          </Group>
          
          <Text 
            size="2rem" 
            fw={600} 
            style={{ lineHeight: 1.2 }}
            className="mb-4"
          >
            {title}
          </Text>

          {Array.isArray(tags) && tags.length > 0 && (
            <Group gap="xs" mb={4}>
              {tags.map((tag: string, index: number) => (
                <div
                  key={index}
                  className="px-2 py-1 text-xs rounded-md bg-gray-100/10 text-primary"
                >
                  {tag}
                </div>
              ))}
            </Group>
          )}
        </div>
      </div>
      
      <div
        className="flex items-center gap-4 text-xs pt-4"
        style={{
          color: "rgb(var(--muted-foreground))",
          borderTopColor: "var(--border)",
          borderTopWidth: "1px",
        }}
      >
        <div className="flex items-center gap-1">
          <span>
            Last updated:{" "}
            {page?.updatedAt
              ? new Date(page.updatedAt).toLocaleDateString("en-US", {
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
  const { pages } = useAllPages();
  return (
    <PageProvider>
      <DocsLayout toc={<TocComponent />} pages={pages}>
        <PageHeader />
        {children}
      </DocsLayout>
    </PageProvider>
  );
}
