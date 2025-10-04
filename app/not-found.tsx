"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import {
  Badge,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-[-6rem] h-64 w-64 rounded-full bg-[rgba(59,130,246,0.08)] blur-3xl dark:bg-[rgba(59,130,246,0.16)]" />
        <div className="absolute right-[-6rem] bottom-[-8rem] h-80 w-80 rounded-full bg-[rgba(16,185,129,0.06)] blur-3xl dark:bg-[rgba(16,185,129,0.14)]" />
      </div>

      <header className="flex items-center justify-between px-6 py-6 sm:px-12">
        <ThemeToggle />
      </header>

      <Container
        size="sm"
        className="flex flex-1 items-center justify-center px-6 pb-16"
      >
        <Paper
          radius="lg"
          p="xl"
          shadow="xl"
          withBorder
          className="w-full max-w-xl backdrop-blur supports-[backdrop-filter]:bg-[rgba(255,255,255,0.7)] supports-[backdrop-filter]:dark:bg-[rgba(12,12,12,0.65)]"
          style={{
            backgroundColor: "rgba(var(--card), 0.78)",
            borderColor: "rgba(var(--border), 0.6)",
          }}
        >
          <Stack gap="md">
            <Badge
              size="lg"
              variant="light"
              radius="md"
              color="dark"
              className="w-fit"
            >
              404
            </Badge>
            <Title
              order={2}
              className="text-3xl font-semibold tracking-tight text-primary"
            >
              Page not found
            </Title>
            <Text size="md" c="dimmed">
              We couldn&apos;t find the page you&apos;re looking for. Please
              check the link or return to the homepage to explore Kebon
              documentation.
            </Text>
            <Group gap="md" mt="sm">
              <Button
                size="md"
                component={Link}
                href="/"
                leftSection={<Icon icon="mdi:home" width={18} height={18} />}
              >
                Go to homepage
              </Button>
              <Button
                size="md"
                variant="subtle"
                color="gray"
                type="button"
                onClick={() => window.history.back()}
                leftSection={
                  <Icon icon="mdi:arrow-left" width={18} height={18} />
                }
              >
                Previous page
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
