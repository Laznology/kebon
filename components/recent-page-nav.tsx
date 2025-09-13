"use client";
import { useFetch } from "@mantine/hooks";
import { Group, Stack, Alert, Skeleton, Text, ScrollArea } from "@mantine/core";
import Link from "next/link";
import { NavLink } from "@mantine/core";
import { usePathname } from "next/navigation";
import { AlertCircle, FileText } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import { Icon } from "@iconify/react";

dayjs.extend(relativeTime);
dayjs.locale("id");

interface ResponseAPI {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
}

export default function RecentPageNav() {
  const { data, loading, error } =
    useFetch<ResponseAPI[]>("/api/pages?limit=3");
  const pathname = usePathname();

  return (
    <NavLink
      href="#required-for-focus"
      label="Draf Pages"
      leftSection={
        <Icon icon={"mdi:clock-outline"} width={16} height={16} stroke={"1"} />
      }
      childrenOffset={28}
    >
      {loading && (
        <Stack gap="xs">
          <Skeleton height={40} radius="sm" />
          <Skeleton height={40} radius="sm" />
          <Skeleton height={40} radius="sm" />
        </Stack>
      )}

      {error && (
        <Alert icon={<AlertCircle size={16} />} title="Error" color="red">
          Failed to load recent pages
        </Alert>
      )}

      {data && data.length > 0 && (
        <ScrollArea scrollHideDelay={0}>
          {data.map((page) => {
            const href = `/${page.slug ?? ""}`.replace(/\/{2,}/g, "/");
            const active = pathname === href;
            const timeAgo = dayjs(page.createdAt).fromNow();

            return (
              <NavLink
                key={page.id}
                component={Link}
                href={href}
                active={active}
                className="py-2"
                classNames={{
                  root: "transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md",
                  label: "flex items-center gap-2 w-full",
                }}
                label={
                  <Group
                    gap="xs"
                    align="flex-start"
                    wrap="nowrap"
                    className="w-full"
                  >
                    <FileText
                      size={16}
                      className="text-gray-500 mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Text size="sm" fw={400} className="truncate">
                        {page.title}
                      </Text>
                      <Text size="xs" c="dimmed" className="mt-0.5">
                        {timeAgo}
                      </Text>
                    </div>
                  </Group>
                }
              />
            );
          })}
        </ScrollArea>
      )}

      {!loading && !error && data?.length === 0 && (
        <Text size="sm" c="dimmed" className="text-center py-4">
          No recent pages
        </Text>
      )}
    </NavLink>
  );
}
