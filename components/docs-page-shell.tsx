"use client";

import { ReactNode, useEffect, useRef } from "react";
import { Button, Group, Text } from "@mantine/core";
import { Icon } from "@iconify/react";
import DocsLayout from "@/components/docs-layout";
import { TableOfContents } from "@/components/TableOfContents";
import type { Page } from "@/types/page";
import { PageProvider, usePage } from "@/app/[slug]/page-provider";
import type { CurrentPage } from "@/types/page";
import type { TocItem } from "@/lib/toc";

const TocComponent = () => {
  const { tocItems } = usePage();
  const reinitializeRef = useRef(() => {});

  useEffect(() => {
    const timer = setTimeout(() => {
      reinitializeRef.current();
    }, 300);

    return () => clearTimeout(timer);
  }, [tocItems]);

  return (
    <TableOfContents tocItems={tocItems} reinitializeRef={reinitializeRef} />
  );
};

const PageHeader = () => {
  const { page, loading, saving, requestSave } = usePage();

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

  const slug = page?.slug ?? "index";
  const breadcrumbLabel = slug === "index" ? "home" : slug;
  const fallbackTitle = slug === "index" ? "Home" : slug.replace(/-/g, " ");
  const frontmatter = page?.frontmatter as Record<string, unknown> | undefined;
  const title =
    (frontmatter?.title as string | undefined) ??
    page?.title ??
    fallbackTitle;
  const tags = Array.isArray(frontmatter?.tags)
    ? (frontmatter?.tags as string[])
    : [];

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
              {breadcrumbLabel}
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

          {tags.length > 0 && (
            <Group gap="xs" mb={4}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="px-2 py-1 text-xs rounded-md bg-gray-100/10 text-primary"
                >
                  {tag}
                </div>
              ))}
            </Group>
          )}
        </div>
        <Button
          variant="light"
          size="xs"
          onClick={requestSave}
          loading={saving}
          leftSection={<Icon icon="mdi:content-save" width={14} height={14} />}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div
        className="flex items-center gap-4 text-xs pt-4"
        style={{
          color: "rgb(var(--muted-foreground))",
        }}
      >
        <div className="flex items-center gap-1">
          <span>
            Last updated: {page?.updatedAt
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

export type DocsPageShellProps = {
  children: ReactNode;
  pages: Page[];
  slug: string;
  initialPage?: CurrentPage | null;
  initialToc?: TocItem[];
};

export default function DocsPageShell({
  children,
  pages,
  slug,
  initialPage,
  initialToc,
}: DocsPageShellProps) {
  return (
    <PageProvider
      slug={slug}
      initialPage={initialPage ?? null}
      initialToc={initialToc}
    >
      <DocsLayout pages={pages} toc={<TocComponent />}>
        <PageHeader />
        {children}
      </DocsLayout>
    </PageProvider>
  );
}
