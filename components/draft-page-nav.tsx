"use client";
import { useFetch } from "@mantine/hooks";
import {
  Group,
  Stack,
  Alert,
  Skeleton,
  Text,
  ScrollArea,
  Box,
  Button,
  Menu,
} from "@mantine/core";
import Link from "next/link";
import { NavLink } from "@mantine/core";
import { usePathname } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Icon } from "@iconify/react";
import "dayjs/locale/id";
import { notifications } from "@mantine/notifications";

dayjs.extend(relativeTime);
dayjs.locale("id");

interface ResponseAPI {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  published: boolean;
}

export default function DraftPageNav() {
  const { data, loading, error, refetch } = useFetch<ResponseAPI[]>(
    "/api/pages?published=false&limit=5",
  );
  const pathname = usePathname();

  return (
    <NavLink
      component={Box}
      label="Draf Pages"
      leftSection={
        <Icon
          icon={"mdi:pencil-plus-outline"}
          width={16}
          height={16}
          stroke={"1"}
        />
      }
      childrenOffset={28}
      className="border-b border"
    >
      {loading && (
        <Stack gap="xs">
          <Skeleton height={40} radius="sm" />
          <Skeleton height={40} radius="sm" />
          <Skeleton height={40} radius="sm" />
        </Stack>
      )}

      {error && (
        <Alert
          icon={<Icon icon="mdi:alert-circle" width={16} />}
          title="Error"
          color="red"
        >
          Failed to load draft pages
        </Alert>
      )}

      {data && data.length > 0 && (
        <ScrollArea h={200} scrollHideDelay={0}>
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
                rightSection={
                  <Menu>
                    <Menu.Target>
                      <Button size="sm" color="gray" variant="transparent">
                        <Icon icon={"pepicons-pencil:dots-y"}></Icon>
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Button
                        size="xs"
                        variant="transparent"
                        onClick={async (e) => {
                          e.preventDefault();
                          try {
                            const response = await fetch(
                              `/api/pages/${page.slug}/published`,
                              {
                                method: "PATCH",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ published: !page.published }),
                              },
                            );
                            if (!response.ok) {
                              notifications.show({
                                title: "Error",
                                message: "Failed to publish page",
                                color: "red",
                              });
                              return;
                            }
                            notifications.show({
                              title: "Success",
                              message: "Page published successfully",
                              color: "green",
                            });
                            await refetch();
                            window.dispatchEvent(
                              new CustomEvent("pagePublished"),
                            );
                          } catch (error) {
                            notifications.show({
                              title: "Error",
                              message: `Failed to publish page ${error}`,
                              color: "red",
                            });
                          }
                        }}
                      >
                        {page.published ? "Unpublish" : "Publish"}
                      </Button>
                    </Menu.Dropdown>
                  </Menu>
                }
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
                    <Icon
                      icon="mdi:file-document-outline"
                      width={16}
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
          No draft pages
        </Text>
      )}
    </NavLink>
  );
}
