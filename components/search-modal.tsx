"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Spotlight,
  SpotlightActionData,
  spotlight,
} from "@mantine/spotlight";
import { Icon } from "@iconify/react";
import { Text, Badge, Group, Stack } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";

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

interface SearchModalProps {
  pages: SearchablePage[];
}

function extractTextFromMarkdown(markdown: string): string {
  if (!markdown) return "";
  
  return markdown
    .replace(/^---[\s\S]*?---/, "")
    .replace(/#{1,6}\s+/g, "") // Headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\*(.*?)\*/g, "$1") // Italic
    .replace(/~~(.*?)~~/g, "$1") // Strikethrough
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/```[\s\S]*?```/g, "") // Code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // Images
    .replace(/^\s*[-*+]\s+/gm, "") // List items
    .replace(/^\s*\d+\.\s+/gm, "") // Numbered lists
    .replace(/^\s*>\s+/gm, "") // Blockquotes
    .replace(/\n{2,}/g, "\n") // Multiple newlines
    .trim();
}

function createExcerpt(text: string, maxLength: number = 150): string {
  const cleaned = extractTextFromMarkdown(text);
  if (cleaned.length <= maxLength) return cleaned;
  
  const truncated = cleaned.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > 0 
    ? truncated.slice(0, lastSpace) + "..." 
    : truncated + "...";
}

function searchPages(
  pages: SearchablePage[],
  query: string
): SearchablePage[] {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase().trim();
  const searchWords = searchTerm.split(/\s+/);
  
  return pages
    .map(page => {
      let score = 0;
      const title = page.title.toLowerCase();
      const content = extractTextFromMarkdown(page.content).toLowerCase();
      const tags = page.tags.map(tag => tag.toLowerCase()).join(" ");
      
      if (title.includes(searchTerm)) score += 100;
      
      searchWords.forEach(word => {
        if (title.includes(word)) score += 50;
      });
      
      searchWords.forEach(word => {
        const contentMatches = (content.match(new RegExp(word, "g")) || []).length;
        score += contentMatches * 5;
      });
      
      searchWords.forEach(word => {
        if (tags.includes(word)) score += 30;
      });
      
      return { ...page, score };
    })
    .filter(page => page.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export default function SearchModal({ pages }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchablePage[]>([]);

  useHotkeys([['ctrl+K', () => spotlight.open()]]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        const results = searchPages(pages, query);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [query, pages]);

  const actions: SpotlightActionData[] = useMemo(() => {
    const searchActions = searchResults.map((page) => ({
      id: page.slug,
      label: page.title,
      description: createExcerpt(page.content, 120),
      onClick: () => {
        router.push(`/${page.slug}`);
        spotlight.close();
      },
      leftSection: (
        <div style={{ marginRight: '12px', flexShrink: 0 }}>
          <Icon icon="mdi:file-document-outline" width={18} height={18} />
        </div>
      ),
      rightSection: page.tags.length > 0 && (
        <Group gap={4} style={{ flexShrink: 0 }}>
          {page.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              size="xs"
              variant="light"
              leftSection={<Icon icon="mdi:hash" width={10} height={10} />}
            >
              {tag}
            </Badge>
          ))}
          {page.tags.length > 2 && (
            <Badge size="xs" variant="outline">
              +{page.tags.length - 2}
            </Badge>
          )}
        </Group>
      ),
    }));

    if (query.trim()) {
      const createPageAction = {
        id: 'create-new-page',
        label: `Create "${query.trim()}"`,
        description: 'Create a new page with this title',
        onClick: async () => {
          try {
            const response = await fetch('/api/pages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: query.trim(),
                content: `# ${query.trim()}\n\nStart writing your content here...`,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to create page');
            }

            const data = await response.json();
            router.push(`/${data.slug}`);
            spotlight.close();
          } catch (error) {
            console.error('Error creating page:', error);
          }
        },
        leftSection: (
          <div style={{ marginRight: '12px', flexShrink: 0 }}>
            <Icon icon="mdi:plus-circle-outline" width={18} height={18} />
          </div>
        ),
      };

      return [createPageAction, ...searchActions];
    }

    return searchActions;
  }, [searchResults, router, query]);

  return (
    <Spotlight.Root 
      query={query} 
      onQueryChange={setQuery}
      styles={{
        root: {
          borderRadius: '12px',
          overflow: 'hidden',
        },
        search: {
          padding: '16px',
          borderBottom: '1px solid var(--mantine-color-gray-3)',
        },
        actionsList: {
          padding: '8px',
        },
      }}
    >
      <Spotlight.Search
        placeholder="Search pages and content..."
        leftSection={<Icon icon="mdi:magnify" width={20} height={20} />}
      />
      <Spotlight.ActionsList>
        {actions.length > 0 ? (
          actions.map((action, index) => (
            <React.Fragment key={action.id}>
              <Spotlight.Action 
                {...action}
                styles={{
                  action: {
                    padding: '12px 16px',
                    margin: '4px 0',
                    borderRadius: '8px',
                    backgroundColor: action.id === 'create-new-page' ? 'var(--mantine-color-blue-0)' : 'transparent',
                    border: action.id === 'create-new-page' ? '1px solid var(--mantine-color-blue-2)' : 'none',
                    '&:hover': {
                      backgroundColor: action.id === 'create-new-page' ? 'var(--mantine-color-blue-1)' : 'var(--mantine-color-gray-1)',
                    },
                  },
                }}
              >
                <Group justify="space-between" wrap="nowrap" w="100%" gap="md" align="flex-start">
                  {action.leftSection}
                  <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                    <Text 
                      fw={action.id === 'create-new-page' ? 600 : 500} 
                      truncate
                      c={action.id === 'create-new-page' ? 'blue' : undefined}
                    >
                      {action.label}
                    </Text>
                    {action.description && (
                      <Text size="xs" c="dimmed" lineClamp={2} style={{ marginTop: '2px' }}>
                        {action.description}
                      </Text>
                    )}
                  </Stack>
                  {action.rightSection && (
                    <div style={{ flexShrink: 0 }}>
                      {action.rightSection}
                    </div>
                  )}
                </Group>
              </Spotlight.Action>
              {action.id === 'create-new-page' && index < actions.length - 1 && (
                <div style={{ 
                  height: '1px', 
                  backgroundColor: 'var(--mantine-color-gray-3)', 
                  margin: '8px 16px' 
                }} />
              )}
            </React.Fragment>
          ))
        ) : query.trim() ? (
          <Spotlight.Empty>
            <Stack align="center" gap="md" py="xl" px="md">
              <Icon icon="mdi:magnify" width={48} height={48} style={{ opacity: 0.3 }} />
              <div style={{ textAlign: 'center' }}>
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
              <Icon icon="mdi:magnify" width={48} height={48} style={{ opacity: 0.3 }} />
              <div style={{ textAlign: 'center' }}>
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
