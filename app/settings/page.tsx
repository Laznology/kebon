"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  TextInput,
  Button,
  Stack,
  Title,
  Text,
  Group,
  Alert,
  LoadingOverlay,
  Switch,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Icon } from "@iconify/react";
import PageLayout from "@/components/page-layout";
import UserTable from "@/components/user-table";

interface AppSettings {
  id: number;
  allowRegister: boolean;
  allowedEmails: string;
  appName: string;
  appLogo: string;
  siteIcon: string;
}

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const hasFetched = useRef(false);

  const form = useForm<AppSettings>({
    mode: "uncontrolled",
    initialValues: {
      id: 0,
      allowRegister: true,
      allowedEmails: "",
      appName: "Kebon",
      appLogo: "/logo.webp",
      siteIcon: "/favicon.ico",
    },
    validate: {
      appName: (value) => (value.length < 1 ? "App name is required" : null),
      appLogo: (value) =>
        value.length < 1 ? "App logo URL is required" : null,
      siteIcon: (value) =>
        value.length < 1 ? "Site icon URL is required" : null,
    },
  });

  const fetchSettings = useCallback(async () => {
    if (hasFetched.current) return;

    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const result = await response.json();
        const settingsData = result.data;

        if (settingsData) {
          form.setValues(settingsData);
        }
      }
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to load settings",
        color: "red",
      });
    } finally {
      setLoading(false);
      hasFetched.current = true;
    }
  }, [form]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSettings();
    }
  }, [status, fetchSettings]);

  const handleSubmit = async (values: AppSettings) => {
    setSaving(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        notifications.show({
          title: "Success",
          message: "Settings updated successfully",
          color: "green",
        });
      } else {
        throw new Error("Failed to update settings");
      }
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to update settings",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <PageLayout>
        <LoadingOverlay visible />
      </PageLayout>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <PageLayout>
      <Stack gap="lg">
        <Group>
          <Icon icon="mdi:cog" width={32} height={32} />
          <div>
            <Title order={2}>Application Settings</Title>
            <Text c="dimmed">Configure your application settings</Text>
          </div>
        </Group>

        <Card withBorder p="lg" style={{ maxWidth: 800, margin: "0 auto" }}>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Title order={3} size="h4">
                General Settings
              </Title>

              <TextInput
                label="Application Name"
                description="The name of your application"
                placeholder="Enter application name"
                key={form.key("appName")}
                {...form.getInputProps("appName")}
                leftSection={
                  <Icon icon="mdi:application" width={16} height={16} />
                }
              />

              <TextInput
                label="Application Logo"
                description="Path to your application logo (e.g., /logo.webp)"
                placeholder="/logo.webp"
                key={form.key("appLogo")}
                {...form.getInputProps("appLogo")}
                leftSection={<Icon icon="mdi:image" width={16} height={16} />}
              />

              <TextInput
                label="Site Icon"
                description="Path to your site favicon (e.g., /favicon.ico)"
                placeholder="/favicon.ico"
                key={form.key("siteIcon")}
                {...form.getInputProps("siteIcon")}
                leftSection={<Icon icon="mdi:web" width={16} height={16} />}
              />

              <Title order={3} size="h4" mt="md">
                Authentication Settings
              </Title>

              <Switch
                label="Allow Registration"
                description="Allow new users to register for accounts"
                key={form.key("allowRegister")}
                {...form.getInputProps("allowRegister", { type: "checkbox" })}
              />

              <Textarea
                label="Allowed Emails"
                description="Comma-separated list of emails allowed to sign in with Github OAuth. Leave empty to allow all emails. For security, it's recommended to restrict to trusted emails to prevent unauthorized access."
                placeholder="user1@example.com, user2@example.com"
                autosize
                minRows={3}
                key={form.key("allowedEmails")}
                {...form.getInputProps("allowedEmails")}
                leftSection={<Icon icon="mdi:email" width={16} height={16} />}
              />

              <Alert
                icon={<Icon icon="mdi:information" width={16} height={16} />}
                color="blue"
                variant="light"
              >
                <Text size="sm">
                  Make sure the logo and icon files exist in your public
                  directory. Recommended formats: .webp for logo, .ico for Site
                  Icon.
                </Text>
              </Alert>

              <Group justify="flex-end" mt="lg">
                <Button
                  type="submit"
                  loading={saving}
                  leftSection={
                    <Icon icon="mdi:content-save" width={16} height={16} />
                  }
                >
                  Save Settings
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>

        <Card withBorder p="lg" style={{ maxWidth: 800, margin: "0 auto" }}>
          <Stack gap="md">
            <div>
              <Title order={3} size="h4">
                User Management
              </Title>
              <Text size="sm" c="dimmed">
                Manage your application users. You can edit or remove users as
                needed.
              </Text>
            </div>

            <UserTable />
          </Stack>
        </Card>
      </Stack>
    </PageLayout>
  );
}
