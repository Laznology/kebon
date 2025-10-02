"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { ActionIcon, Badge, Button, Group, Text, TextInput } from "@mantine/core";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/page-layout";
import { TableOfContents } from "@/components/TableOfContents";
import { PageProvider, usePage } from "@/app/[slug]/page-provider";
import type { CurrentPage } from "@/types/page";
import type { TocItem } from "@/lib/toc";
import { useSession } from "next-auth/react";
import { useHotkeys } from "@mantine/hooks";

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
  const { status } = useSession();
  const { page, loading, saving, requestSave } = usePage();
  const router = useRouter();
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  useHotkeys([
    ["Enter", () => handleAddTag],
    [
      "Escape",
      () => {
        setNewTag("");
        setIsAddingTag(false);
      },
    ],
  ]);

  useEffect(() => {
    if (page) {
      setEditedTitle(page.title);
      setEditedTags(Array.isArray(page.tags) ? page.tags : []);
    }
  }, [page]);

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

  const handleAddTag = () => {
    if (newTag.trim()) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag("");
      setIsAddingTag(false);
    }
  };


  const handleRemoveTag = (index: number) => {
    setEditedTags(editedTags.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const result = await requestSave(editedTitle, editedTags);
    if (result?.newSlug && result.newSlug !== page?.slug) {
      router.push(`/${result.newSlug}`);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <TextInput
            variant="unstyled"
            size="xl"
            disabled={status !== "authenticated"}
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            styles={{
              input: {
                fontSize: "2rem",
                fontWeight: 600,
                lineHeight: 1.2,
                background: "transparent",
                "&:focus": {
                  outline: "1px solid rgba(0,0,0,0.1)",
                  outlineOffset: "4px",
                },
              },
            }}
          />
          <div className="flex flex-warp items-center gap-2">
            {editedTags.map((tag, index) => (
              <Badge
                color="gray"
                radius={"sm"}
                key={index}
                variant="light"
                size="sm"
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="gray"
                    radius="xs"
                    variant="transparent"
                    onClick={() => handleRemoveTag(index)}
                  >
                    <Icon icon={"mdi:close"} width={12} height={12} />
                  </ActionIcon>
                }
              >
                {tag}
              </Badge>
            ))}
            {isAddingTag ? (
              <TextInput 
                size="xs"
                variant="unstyled"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onBlur={handleAddTag}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
                placeholder="Enter tag ..."
                autoFocus 
              />
            ): (
                <ActionIcon
                    variant="light"
                    size="lg"
                    onClick={() => setIsAddingTag(true)}
                    color="gray"
                >
                    <Icon icon={"mdi:plus"} width={12} height={12} />
                </ActionIcon>
            )}
          </div>
        </div>
        {status === "authenticated" && (
          <Button
            variant="light"
            size="xs"
            onClick={handleSave}
            loading={saving}
            leftSection={
              <Icon icon="mdi:content-save" width={14} height={14} />
            }
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>

      <div
        className="flex items-center gap-4 text-xs pt-4"
        style={{
          color: "rgb(var(--muted-foreground))",
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

export type PageShellProps = {
  children: ReactNode;
  slug: string;
  initialPage?: CurrentPage | null;
  initialToc?: TocItem[];
};

export default function PageShell({
  children,
  slug,
  initialPage,
  initialToc,
}: PageShellProps) {
  return (
    <PageProvider
      slug={slug}
      initialPage={initialPage ?? null}
      initialToc={initialToc}
    >
      <PageLayout toc={<TocComponent />}>
        <PageHeader />
        {children}
      </PageLayout>
    </PageProvider>
  );
}
