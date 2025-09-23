"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Spotlight, SpotlightActionData, spotlight } from "@mantine/spotlight";
import { Icon } from "@iconify/react";
import { Text, Badge, Group, Stack } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { useSearch } from "@/hooks/useSearch";
import type { SearchResult } from "@/hooks/useSearch";

export interface SearchablePage {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  created?: string;
  updated?: string;
}

function createExcerpt(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) return text || "";

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0
    ? truncated.slice(0, lastSpace) + "..."
    : truncated + "...";
}

export default function SearchModal() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { results, setQuery: setSearchQuery } = useSearch();

  useHotkeys([
    [
      "mod+K",
      (event) => {
        event.preventDefault();
        spotlight.open();
      },
    ],
  ]);

  useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);

  const actions: SpotlightActionData[] = useMemo(() => {
    const searchActions = results.map((result: SearchResult) => ({
      id: result.slug,
      label: result.highlightedTitle || result.title,
      description: createExcerpt(
        result.highlightedExcerpt || result.excerpt || "",
        120,
      ),
      onClick: () => {
        router.push(`/${result.slug}`);
        spotlight.close();
      },
      leftSection: (
        <div style={{ marginRight: "12px", flexShrink: 0 }}>
          <Icon icon="mdi:file-document-outline" width={18} height={18} />
        </div>
      ),
      rightSection: result.tags && result.tags.length > 0 && (
        <Group gap={4} style={{ flexShrink: 0 }}>
          {result.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              size="xs"
              variant="light"
              leftSection={<Icon icon="mdi:hash" width={10} height={10} />}
            >
              {tag}
            </Badge>
          ))}
          {result.tags.length > 2 && (
            <Badge size="xs" variant="outline">
              +{result.tags.length - 2}
            </Badge>
          )}
        </Group>
      ),
    }));

    if (query.trim()) {
      const createPageAction = {
        id: "create-new-page",
        label: `Create "${query.trim()}"`,
        description: "Create a new page with this title",
        onClick: async () => {
          try {
            const response = await fetch("/api/pages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: query.trim(),
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to create page");
            }

            const data = await response.json();
            router.push(`/${data.page.slug}`);
            spotlight.close();
          } catch (error) {
            console.error("Error creating page:", error);
          }
        },
        leftSection: (
          <div style={{ marginRight: "12px", flexShrink: 0 }}>
            <Icon icon="mdi:plus-circle-outline" width={18} height={18} />
          </div>
        ),
      };

      return [createPageAction, ...searchActions];
    }

    return searchActions;
  }, [results, router, query]);

  return (
    <Spotlight.Root
      query={query}
      onQueryChange={setQuery}
      styles={{
        root: {
          borderRadius: "12px",
          overflow: "hidden",
        },
        search: {
          padding: "16px",
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        },
        actionsList: {
          padding: "8px",
        },
      }}
    >
      <Spotlight.Search
        placeholder="Search pages and content..."
        leftSection={<Icon icon="mdi:magnify" width={18} height={18} />}
        leftSectionPointerEvents="none"
        styles={{
          input: {
            paddingLeft: "40px",
          },
        }}
      />
      <Spotlight.ActionsList>
        {actions.length > 0 ? (
          actions.map((action, index) => (
            <React.Fragment key={action.id}>
              <Spotlight.Action
                {...action}
                styles={{
                  action: {
                    padding: "12px 16px",
                    margin: "4px 0",
                    borderRadius: "8px",
                    backgroundColor:
                      action.id === "create-new-page"
                        ? "var(--mantine-color-blue-0)"
                        : "transparent",
                    border:
                      action.id === "create-new-page"
                        ? "1px solid var(--mantine-color-blue-2)"
                        : "none",
                    "&:hover": {
                      backgroundColor:
                        action.id === "create-new-page"
                          ? "var(--mantine-color-blue-1)"
                          : "var(--mantine-color-gray-1)",
                    },
                  },
                }}
              >
                <Group
                  justify="space-between"
                  wrap="nowrap"
                  w="100%"
                  gap="md"
                  align="flex-start"
                >
                  {action.leftSection}
                  <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      dangerouslySetInnerHTML={{ __html: action.label ?? "" }}
                      fw={action.id === "create-new-page" ? 600 : 500}
                      truncate
                      c={action.id === "create-new-page" ? "blue" : undefined}
                    />
                    {action.description && (
                      <Text
                        size="xs"
                        c="dimmed"
                        lineClamp={2}
                        style={{ marginTop: "2px" }}
                      >
                        {action.description}
                      </Text>
                    )}
                  </Stack>
                  {action.rightSection && (
                    <div style={{ flexShrink: 0 }}>{action.rightSection}</div>
                  )}
                </Group>
              </Spotlight.Action>
              {action.id === "create-new-page" &&
                index < actions.length - 1 && (
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "var(--mantine-color-gray-3)",
                      margin: "8px 16px",
                    }}
                  />
                )}
            </React.Fragment>
          ))
        ) : query.trim() ? (
          <Spotlight.Empty>
            <Stack align="center" gap="md" py="xl" px="md">
              <Icon
                icon="mdi:magnify"
                width={48}
                height={48}
                style={{ opacity: 0.3 }}
              />
              <div style={{ textAlign: "center" }}>
                <Text size="sm" fw={500}>
                  No results found
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  Try adjusting your search query
                </Text>
              </div>
            </Stack>
          </Spotlight.Empty>
        ) : (
          <Spotlight.Empty>
            <Stack align="center" gap="md" py="xl" px="md">
              <Icon
                icon="mdi:magnify"
                width={48}
                height={48}
                style={{ opacity: 0.3 }}
              />
              <div style={{ textAlign: "center" }}>
                <Text size="sm" fw={500}>
                  Start typing to search
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  Search through titles, content, and tags
                </Text>
              </div>
            </Stack>
          </Spotlight.Empty>
        )}
      </Spotlight.ActionsList>
    </Spotlight.Root>
  );
}

export { spotlight };
