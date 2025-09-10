"use client";
import {
  Button,
  Divider,
  Group,
  Kbd,
  ScrollArea,
  Text,
  Title,
} from "@mantine/core";
import AddPageButton from "@/components/add-page-button";
import { signOut } from "next-auth/react";
import { AppShell, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Icon } from "@iconify/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import React from "react";
import SearchModal from "@/components/search-modal";
import NavigationMenu from "@/components/NavigationMenu";
import { useAllDocuments } from "@/hooks/useAllDocuments";
import Image from "next/image";

export default function Page() {
  const [opened, { open, close }] = useDisclosure(false);
  const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure(false);
  const { documents } = useAllDocuments();
  return (
    <AppShell
      header={{ height: { base: 60, md: 60 } }}
      navbar={{
        width: { base: 280, md: 300 },
        breakpoint: "md",
        collapsed: { mobile: !mobileNavOpened, desktop: false },
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
            <ThemeToggle />
          </Group>
        </Group>
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
      <AppShell.Main className={"h-screen flex items-center justify-center"}>
        <div className={"space-y-6"}>
          <Image
            src={"/Kebon.ico"}
            width={400}
            height={400}
            className={"object-cover"}
            alt={"Logo"}
          />
          <Text className={"text-center"} c={"dimmed"}>
            Where idea goes to blow up XD
          </Text>
          <Group gap={"xl"} justify={"center"} grow>
            <AddPageButton />
            <Button onClick={() => signOut()} color={"red"} variant={"filled"}>
              Sign Out
            </Button>
          </Group>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
