"use client";
import { ReactNode, useMemo } from "react";
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
  TextInput,
  Text,
  Popover,
  Button,
  NavLink,
} from "@mantine/core";
import React from "react";
import { useDisclosure, useHotkeys, useMediaQuery } from "@mantine/hooks";
import { Icon } from "@iconify/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import NavigationMenu from "@/components/navigation-menu";
import SearchModal from "@/components/search-modal";
import type { Document } from "@/types/document";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

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
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const currentSlug = useMemo(() => {
    if (!pathname) return "";
    const clean = pathname.replace(/^\//, "");
    return clean;
  }, [pathname]);

  useHotkeys([["mod+/", () => open()]]);

  return (
    <AppShell
      header={{ height: { base: 64, md: 64 } }}
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
      <AppShell.Header
        style={{
          backdropFilter: "saturate(180%) blur(6px)",
          WebkitBackdropFilter: "saturate(180%) blur(6px)",
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger
              opened={mobileNavOpened}
              onClick={toggleMobileNav}
              hiddenFrom={"md"}
              size={"sm"}
            />
            <Group gap={6}>
              <Icon
                icon={"mdi:book-open-page-variant"}
                width={22}
                height={22}
              />
              <Title order={4}>Kebon.</Title>
            </Group>
          </Group>
          <Group gap="sm" align="center">
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
          <TextInput
            size="sm"
            leftSection={<Icon icon="line-md:search" width={16} height={16} />}
            placeholder="Search ..."
            onClick={open}
            rightSectionWidth={100}
            rightSection={
              <div className="absolute flex items-center gap-1 pr-1 text-[11px] text-gray-500">
                <Kbd>Ctrl</Kbd>+<Kbd>/</Kbd>
              </div>
            }
            readOnly
          />
          <SearchModal opened={opened} onClose={close} documents={documents} />
        </AppShell.Section>
        <Divider />
        <AppShell.Section grow component={ScrollArea}>
          <NavigationMenu />
        </AppShell.Section>
        {status === "authenticated" && (
          <AppShell.Section>
            <Group
              justify={"space-between"}
              gap={"md"}
              className="border border-secondary p-2 rounded-lg"
            >
              <div>
                <Text size={"sm"} fw={600} c={"dark"} className={""}>
                  {session?.user.name}
                </Text>
                <Text size={"xs"} fw={600} c={"dimmed"}>
                  {session?.user.email}
                </Text>
              </div>
              <div>
                <Popover
                  floatingStrategy={"fixed"}
                  position="top"
                  width={150}
                  trapFocus
                  withArrow
                  shadow="md"
                >
                  <Popover.Target>
                    <Button
                      variant={"light"}
                      className={"fond-bold"}
                      color={"gray"}
                      size={"xs"}
                    >
                      <Icon
                        icon={"line-md:chevron-up-square"}
                        width={16}
                        height={16}
                      />
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown style={{ padding: 2 }}>
                    <NavLink
                      href={"/settings"}
                      label="Settings"
                      leftSection={<Icon icon="mdi:gear" />}
                    />
                  </Popover.Dropdown>
                </Popover>
              </div>
            </Group>
          </AppShell.Section>
        )}
      </AppShell.Navbar>
      {!isMobile && (
        <AppShell.Aside p={"md"} className={"space-y-3"}>
          <Group mb={"md"} wrap="nowrap">
        <Icon icon={"line-md:list-indented"} width={16} height={16} />
        <h6>Table of Contents</h6>
          </Group>
          <Divider />
          <ScrollArea style={{ maxHeight: "calc(100vh - 140px)" }}>
        {toc}
          </ScrollArea>
        </AppShell.Aside>
      )}
      <AppShell.Main style={{ overflow: "hidden" }}>
        <div className="mx-auto w-full max-w-none md:max-w-[768px] px-2 md:px-0 min-w-0">
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
