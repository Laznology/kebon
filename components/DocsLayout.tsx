"use client";
import { ReactNode } from "react";
import {
  AppShell,
  Burger,
  Group,
  Paper,
  ScrollArea,
  Title,
  Divider,
  Box,
  Kbd,
} from "@mantine/core";
import React from "react";
import { useDisclosure, useHotkeys, useMediaQuery } from "@mantine/hooks";
import { Icon } from "@iconify/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import NavigationMenu from "@/components/NavigationMenu";
import SearchModal from "@/components/search-modal";
import type { Document } from "@/types/document";

type DocsLayoutProps = {
  children: React.ReactNode;
  toc: ReactNode;
  documents: Document[];
};

export default function DocsLayout({
  children,
  toc,
  documents,
}: DocsLayoutProps) {
  const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure(false);
  const [tocOpened, { toggle: toggleToc }] = useDisclosure(false);
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useHotkeys([["mod+/", () => open()]]);

  return (
    <AppShell
      header={{ height: { base: 60, md: 60 } }}
      navbar={{
        width: { base: 280, md: 300 },
        breakpoint: "md",
        collapsed: { mobile: !mobileNavOpened, desktop: false },
      }}
      aside={{
        width: { base: 280, md: 300 },
        breakpoint: "md",
        collapsed: { mobile: !tocOpened, desktop: false },
      }}
      padding={"md"}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={mobileNavOpened}
              onClick={toggleMobileNav}
              hiddenFrom={"md"}
              size={"sm"}
            />
            <Icon icon={"mdi:book-open-page-variant"} width={24} height={24} />
            <Title order={3}>Documentation</Title>
          </Group>
          <Group>
            {isMobile && (
              <Burger
                opened={tocOpened}
                onClick={toggleToc}
                size={"sm"}
                aria-label={"Toggle Table of Contents"}
              />
            )}
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
              left: "0",
              right: "0",
              maxHeight: "50vh",
              overflow: "auto",
            }}
          >
            <Group>
              <Icon
                icon={"mdi:file-document-multiple"}
                height={16}
                width={16}
              />
              <h6>Table of Contents</h6>
            </Group>
            <Divider />
            <Box>{toc}</Box>
          </Paper>
        )}
      </AppShell.Header>
      <AppShell.Navbar p={"md"} className={"space-y-4"}>
        <AppShell.Section>
          <div
            onClick={open}
            className={
              "flex items-center justify-between gap-3 border rounded-md cursor-pointer py-1 px-1"
            }
          >
            <Group grow align={"center"}>
              <Icon icon={"line-md:search"} width={16} height={16} />
              <p>Search...</p>
            </Group>
            <div className={"flex items-center justify-center"}>
              <Kbd>Ctrl</Kbd>
              <span className="font-mono">+</span>
              <Kbd>/</Kbd>
            </div>
          </div>
          <SearchModal opened={opened} onClose={close} documents={documents} />
        </AppShell.Section>
        <Divider />
        <AppShell.Section grow component={ScrollArea}>
          <NavigationMenu />
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Aside p={"md"} className={"space-y-3"}>
        <Group mb={"md"}>
          <Icon icon={"line-md:list-indented"} width={16} height={16} />
          <h6>Table of Contents</h6>
        </Group>
        <Divider />
        <ScrollArea>{toc}</ScrollArea>
      </AppShell.Aside>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
