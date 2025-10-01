"use client";
import React, { ReactNode } from "react";
import {
  AppShell,
  Burger,
  Group,
  ScrollArea,
  Title,
  Divider,
  Box,
  Kbd,
  TextInput,
  Text,
  Popover,
  Button,
  NavLink,
  Paper,
  Stack,
  Drawer,
  Badge,
  Avatar,
} from "@mantine/core";
import {
  useDisclosure,
  useMediaQuery,
  useFetch,
} from "@mantine/hooks";
import { Icon } from "@iconify/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Page } from "@/types/page";
import dynamic from "next/dynamic";
import { spotlight } from "@mantine/spotlight";
import { useSession, signOut } from "next-auth/react";
import { AddPageButton } from "./add-page-button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

type DocsLayoutProps = {
  children: React.ReactNode;
  toc?: ReactNode;
};

const SearchModal = dynamic(() => import("@/components/search-modal"), {
  ssr: false,
  loading: () => null,
});

export default function DocsLayout({ children, toc }: DocsLayoutProps) {
  const [mobileNavOpened, { toggle: toggleMobileNav, close: closeMobileNav }] =
    useDisclosure(false);
  const [tocOpened, { toggle: toggleToc, close: closeToc }] =
    useDisclosure(false);
  const { data: session, status } = useSession();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const router = useRouter();
  const { data: pages, refetch: refetchPages } = useFetch<Page[]>("/api/pages");

  const renderNavigationContent = (closeOnNavigate = false) => (
    <Box className="flex h-full flex-col" style={{ height: "100%" }}>
      <div>
        <TextInput
          size="sm"
          leftSection={<Icon icon="line-md:search" width={16} height={16} />}
          placeholder="Search ..."
          onClick={spotlight.open}
          rightSectionWidth={100}
          rightSection={
            <div className="absolute flex items-center gap-1 pr-1 text-[11px] text-gray-500">
              <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
            </div>
          }
          readOnly
        />

        <Box mb="md" mt="md">
          <AddPageButton />
        </Box>

        <Group justify="space-between" align="center" mb="md">
          <Text fw={600} size="sm">
            Pages
          </Text>
          <ThemeToggle />
        </Group>
      </div>

      <Divider my="md" />

      <Box className="flex-1 overflow-hidden">
        <ScrollArea h="100%" type="auto">
          <div className="space-y-1">
            {(pages || []).map((page) => (
              <NavLink
                key={page.slug}
                component={Link}
                href={`/${page.slug}`}
                label={
                  <Group justify="space-between" wrap="nowrap">
                    <Text size="sm" truncate="end">
                      {page.title}
                    </Text>
                    {status === "authenticated" && (
                      <Badge
                        size="xs"
                        variant="light"
                        color={page.published ? "green" : "orange"}
                        style={{ fontSize: "10px", minWidth: "auto" }}
                      >
                        {page.published ? "✓" : "○"}
                      </Badge>
                    )}
                  </Group>
                }
                onClick={() => {
                  if (closeOnNavigate) {
                    closeMobileNav();
                  }
                }}
                rightSection={
                  status === "authenticated" && (
                    <Popover>
                      <Popover.Target>
                        <Button
                          variant="transparent"
                          size="sm"
                          aria-label="Edit page options"
                        >
                          <Icon icon={"mdi:file-edit-outline"} />
                        </Button>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <Stack gap={2}>
                          <Button
                            variant="transparent"
                            size="xs"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const nextPublished = !page.published;

                              const response = await fetch(
                                `/api/pages/${page.slug}`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    published: nextPublished,
                                  }),
                                },
                              );

                              if (!response.ok) {
                                return;
                              }

                              await refetchPages();
                              router.refresh();
                            }}
                          >
                            {page.published ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            variant="transparent"
                            size="xs"
                            color="red"
                            onClick={async (e) => {
                              e.preventDefault();
                              const response = await fetch(
                                `/api/pages/${page.slug}`,
                                {
                                  method: "DELETE",
                                  headers: {
                                    "Content-Type": "application.json",
                                  },
                                },
                              );
                              const data = await response.json();
                              if (!response.ok) {
                                notifications.show({
                                  title: `Error deleting ${page.title}`,
                                  message: data.message,
                                  color: "red",
                                });
                              }
                              notifications.show({
                                title: `Succesfully`,
                                message: `Deleted ${page.title}`,
                                color: "green",
                              });
                              await refetchPages();
                            }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Popover.Dropdown>
                    </Popover>
                  )
                }
                leftSection={
                  <Icon
                    icon="mdi:file-document-outline"
                    width={16}
                    height={16}
                  />
                }
              />
            ))}
          </div>
        </ScrollArea>
      </Box>

      {status === "authenticated" && session && (
        <Box mt="md">
          <Divider mb="md" />
          <Group justify="space-between" gap="md" p="sm">
            <Group gap="sm">
              <Avatar
                src={session.user?.image}
                alt={session.user?.name || "User"}
                size={32}
                radius="xl"
              >
                {!session.user?.image && (
                  <Icon icon="mdi:account" width={16} height={16} />
                )}
              </Avatar>
              <div>
                <Text size="sm" fw={600}>
                  {session.user?.name || "User"}
                </Text>
                <Text size="xs" c="dimmed">
                  {session.user?.email}
                </Text>
              </div>
            </Group>
            <Popover position="top" width={150} withArrow shadow="md">
              <Popover.Target>
                <Button
                  variant="light"
                  color="gray"
                  size="xs"
                  aria-label="User menu"
                >
                  <Icon icon="mdi:dots-vertical" width={16} height={16} />
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap={4}>
                  <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    fullWidth
                    component={Link}
                    href="/settings"
                    leftSection={
                      <Icon icon="mdi:cog" width={14} height={14} />
                    }
                  >
                    Settings
                  </Button>
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    fullWidth
                    onClick={() => signOut()}
                    leftSection={
                      <Icon icon="mdi:logout" width={14} height={14} />
                    }
                  >
                    Sign Out
                  </Button>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </Group>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppShell header={isMobile ? { height: 70 } : undefined} padding={0}>
        {isMobile && (
          <AppShell.Header withBorder={false}>
            <Group h="100%" px="md" justify="space-between" align="center">
              <Group>
                <Burger
                  opened={mobileNavOpened}
                  onClick={() => {
                    closeToc();
                    toggleMobileNav();
                  }}
                  size="sm"
                  hiddenFrom="md"
                  aria-label="Toggle navigation menu"
                />
                <Title order={3}>Kebon</Title>
              </Group>
              <Group gap="sm">
                <Burger
                  opened={tocOpened}
                  onClick={() => {
                    closeMobileNav();
                    toggleToc();
                  }}
                  size="sm"
                  hiddenFrom="md"
                  aria-label="Toggle table of contents"
                />
              </Group>
            </Group>
            {tocOpened && (
              <Paper
                className={"space-y-2"}
                shadow={"md"}
                radius={"md"}
                p={"md"}
                m={"md"}
                mt={0}
                style={{
                  zIndex: 100,
                  position: "absolute",
                  top: "100%",
                  maxHeight: "50vh",
                  overflow: "auto",
                }}
              >
                <Box>{toc}</Box>
              </Paper>
            )}
          </AppShell.Header>
        )}

        {isMobile && (
          <Drawer
            opened={mobileNavOpened}
            onClose={closeMobileNav}
            padding="md"
            title="Navigation"
            overlayProps={{ opacity: 0.2 }}
            size="md"
          >
            {renderNavigationContent(true)}
          </Drawer>
        )}

        <AppShell.Main>
          <Box className="container mx-auto px-4 py-6 md:px-8 lg:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10 lg:gap-12">
              <Box
                className="hidden w-64 shrink-0 md:block"
                style={{
                  position: "sticky",
                  top: 24,
                  height: "calc(100vh - 120px)",
                  maxHeight: `calc(100vh - ${24 + 32}px)`,
                  overflow: "hidden",
                }}
              >
                <Paper
                  p="md"
                  style={{
                    height: "100%",
                    borderRight:
                      "1px solid var(--mantine-color-default-border)",
                  }}
                >
                  {renderNavigationContent()}
                </Paper>
              </Box>

              <div className="min-w-0 flex-1">{children}</div>
              <Box
                className="hidden w-64 shrink-0 md:block"
                style={{
                  position: "sticky",
                  top: 88,
                  maxHeight: "calc(100vh - 120px)",
                  overflow: "auto",
                }}
              >
                <Box pr="sm">{toc}</Box>
              </Box>
            </div>
          </Box>
        </AppShell.Main>
      </AppShell>

      <SearchModal />
    </>
  );
}
