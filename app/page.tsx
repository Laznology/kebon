"use client";
import {
  Button,
  Divider,
  Group,
  Kbd,
  NavLink,
  Popover,
  ScrollArea,
  Text,
  Title,
} from "@mantine/core";
import AddPageButton from "@/components/add-page-button";
import { signOut, useSession } from "next-auth/react";
import { AppShell, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Icon } from "@iconify/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import React from "react";
import SearchModal from "@/components/search-modal";
import { useAllDocuments } from "@/hooks/useAllDocuments";
import Image from "next/image";
import { useHotkeys } from "@mantine/hooks";
import NavigationMenu from "@/components/navigation-menu";

export default function Page() {
  const [opened, { open, close }] = useDisclosure(false);
  const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure(false);
  const { documents } = useAllDocuments();
  const { data: session, status } = useSession()
  useHotkeys(
    [['ctrl+/', () => open()]]
  )

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
        <AppShell.Section grow >
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
