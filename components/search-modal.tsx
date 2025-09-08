"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Paper,
  Text,
  Group,
  Box,
  Stack,
  ActionIcon,
  Divider,
  ScrollArea,
} from "@mantine/core";
import { Icon } from "@iconify/react";
import Highlighter from "react-highlight-words";
import { useSearch, SearchableDocument } from "@/hooks/useSearch";
import { type Document } from "@/types/document";
import { useRouter } from "next/navigation";

type SearchModalProps = {
  opened: boolean;
  onClose: () => void;
  documents: Document[];
};

type SearchResultItemProps = {
  item: SearchableDocument;
  query: string;
  onSelect: (slug: string) => void;
};

function SearchResultItem({ item, query, onSelect }: SearchResultItemProps) {
  const handleClick = () => {
    onSelect(item.slug);
  };

  return (
    <Paper
      p={"md"}
      onClick={handleClick}
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300"
    >
      <Group justify="space-between" align="flex-start">
        <div className="flex-1">
          <Group mb={"xs"}>
            <Text fw={500}>
              <Highlighter
                searchWords={query.split("")}
                textToHighlight={item.title}
                highlightClassName="bg-black/20 dark:bg-gray-50/20 text-black dark:text-white"
              ></Highlighter>
            </Text>
          </Group>
          {item.content && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              <Highlighter
                searchWords={query.split(" ")}
                textToHighlight={item.content}
                highlightClassName="bg-black/20 dark:bg-gray-50/20 text-black dark:text-white"
              />
            </Text>
          )}
        </div>
      </Group>
      <Divider />
    </Paper>
  );
}

export default function SearchModal({
  opened,
  onClose,
  documents,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { results, search, clearSearch, hasResults, isSearching } =
    useSearch(documents);
  const router = useRouter();
  const handleResultSelect = (slug: string) => {
    router.push(`/${slug}`);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      search(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, search]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <Icon icon={"line-md:search"} width={20} height={20} />
          <Text fw={500}>Search Pages ...</Text>
        </Group>
      }
      size={"xl"}
    >
      <Stack gap={"md"}>
        <TextInput
          placeholder="Search pages, contents ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          rightSection={
            <ActionIcon
              onClick={() => {
                setSearchQuery("");
              }}
            >
              <Icon icon={"mdi:close"} />
            </ActionIcon>
          }
          autoFocus
          size="md"
        />
        {isSearching && (
          <>
            <Divider />

            {hasResults ? (
              <ScrollArea h={400}>
                <Stack gap="sm">
                  <Text size="sm" c={"dimmed"}>
                    Found {results.length} result
                    {results.length !== 1 ? "s" : ""} for "{searchQuery}"
                  </Text>
                  {results.map((result) => (
                    <SearchResultItem
                      key={result.item.id}
                      item={result.item}
                      query={searchQuery}
                      onSelect={handleResultSelect}
                    />
                  ))}
                </Stack>
              </ScrollArea>
            ) : (
              <Box>Gak Nemu, coba cari yang lain</Box>
            )}
          </>
        )}
        {!isSearching && (
          <Box py="xl" className="flex flex-col items-center justify-center">
            <Icon
              icon="mdi:magnify"
              width={48}
              height={48}
              style={{ opacity: 0.3, marginBottom: "16px" }}
            />
            <Text c="dimmed" size="sm">
              Start typing to search documentation
            </Text>
            <Text c="dimmed" size="xs" mt="xs">
              Search through titles and content
            </Text>
          </Box>
        )}
      </Stack>
    </Modal>
  );
}
