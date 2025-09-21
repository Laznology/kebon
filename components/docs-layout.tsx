"use client";
import { ReactNode } from "react";
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
} from "@mantine/core";
import React from "react";
import { useDisclosure, useHotkeys, useMediaQuery } from "@mantine/hooks";
import { Icon } from "@iconify/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import SearchModal, { spotlight } from "@/components/search-modal";
import type { Page } from "@/types/page";
import { useSession, signOut } from "next-auth/react";
import { AddPageButton } from "./add-page-button";

type DocsLayoutProps = {
  children: React.ReactNode;
  toc: ReactNode;
  pages: Page[];
};

export default function DocsLayout({ children, toc, pages }: DocsLayoutProps) {
  const [mobileNavOpened, { toggle: toggleMobileNav, close: closeMobileNav }] =
    useDisclosure(false);
  const [tocOpened, { toggle: toggleToc, close: closeToc }] = useDisclosure(false);
  const { data: session, status } = useSession();
  const isMobile = useMediaQuery("(max-width: 768px)");

  useHotkeys([["mod+K", spotlight.open]]);

  return (
    <>
      <AppShell
        header={{ height: 70 }}
        navbar={{
          width: { base: 300, md: 300, lg: 300 },
          breakpoint: "md",
          collapsed: { mobile: !mobileNavOpened },
        }}
        aside={{
          width: { base: 280, md: 280, lg: 280 },
          breakpoint: "md",
          collapsed: { mobile: true, desktop: false },
        }}
        padding="md"
      >
        <AppShell.Header>
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
              />
              <Title order={3} c="teal">
                Kebon
              </Title>
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
              <ThemeToggle />
            </Group>
          </Group>
          {isMobile && tocOpened && (
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

        <AppShell.Navbar p="md">
          <AppShell.Section>
          <TextInput
            size="sm"
            leftSection={<Icon icon="line-md:search" width={16} height={16} />}
            placeholder="Search ..."
            onClick={spotlight.open}
            rightSectionWidth={100}
            rightSection={
              <div className="absolute flex items-center gap-1 pr-1 text-[11px] text-gray-500">
                <Kbd>Ctrl</Kbd>+<Kbd>/</Kbd>
              </div>
            }
            readOnly
          />

            <Box mb="md">
              <AddPageButton />
            </Box>

            <Text fw={600} size="sm" mb="md">
              Pages
            </Text>
          </AppShell.Section>

          <Divider />

          <AppShell.Section grow component={ScrollArea} mt="md">
            <div className="space-y-1">
              {pages.map((page) => (
                <NavLink
                  key={page.slug}
                  href={`/${page.slug}`}
                  label={page.title}
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
          </AppShell.Section>

          {status === "authenticated" && session && (
            <AppShell.Section>
              <Divider mb="md" />
              <Group
                justify="space-between"
                gap="md"
                p="sm"
                className="border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div>
                  <Text size="sm" fw={600}>
                    {session.user?.name || "User"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {session.user?.email}
                  </Text>
                </div>
                <Popover position="top" width={150} withArrow shadow="md">
                  <Popover.Target>
                    <Button variant="light" color="gray" size="xs">
                      <Icon icon="mdi:dots-vertical" width={16} height={16} />
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
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
                  </Popover.Dropdown>
                </Popover>
              </Group>
            </AppShell.Section>
          )}
        </AppShell.Navbar>

        <AppShell.Main className="mx-auto container">{children}</AppShell.Main>

        <AppShell.Aside p="md">
          <Box>{toc}</Box>
        </AppShell.Aside>
      </AppShell>

      <SearchModal pages={pages} />
    </>
  );
}
