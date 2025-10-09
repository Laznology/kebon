"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Avatar, Badge, Button, Card, Divider, Group, LoadingOverlay, Stack, Text, TextInput, Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Icon } from "@iconify/react";
import { useFetch } from "@mantine/hooks";
import PageLayout from "@/components/page-layout";

type ProfileResponse = {
  name: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
};

type ProfileValues = {
  name: string;
  email: string;
  image: string;
  role: string;
};

const toValues = (p: ProfileResponse): ProfileValues => ({
  name: p.name ?? "",
  email: p.email ?? "",
  image: p.image ?? "",
  role: p.role ?? "",
});

let fetchedOnce = false;

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();

  const form = useForm<ProfileValues>({
    initialValues: { name: "", email: "", image: "", role: "" },
    validate: {
      name: (v) => (v.trim() ? null : "Name is required"),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Email address is invalid"),
      image: (v) =>
        !v.trim() ||
        v.startsWith("http://") ||
        v.startsWith("https://") ||
        v.startsWith("/")
          ? null
          : "Use an absolute URL or a path that starts with /",
    },
  });

  const [initialValues, setInitialValues] = useState<ProfileValues | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch, abort } = useFetch<ProfileResponse>("/api/profile", {
    autoInvoke: false,
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }
    if (status === "authenticated" && !fetchedOnce) {
      fetchedOnce = true;
      refetch();
      return () => abort();
    }
  }, [status, router, refetch, abort]);

  useEffect(() => {
    if (!data) return;
    const values = toValues(data);
    form.setValues(values);
    setInitialValues(values);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!error) return;
    notifications.show({
      title: "Unable to load profile",
      message: "Please try again in a moment.",
      color: "red",
    });
  }, [error]);

  const handleSubmit = async (values: ProfileValues) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          image: values.image.trim() || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error === "Email already in use"
          ? "This email is already in use. Please choose a different one."
          : "Unable to save profile changes right now.";
        notifications.show({
          title: "Update failed",
          message: errorMessage,
          color: "red",
        });
        return;
      }

      const next = {
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
        image: values.image.trim(),
      };
      form.setValues(next);
      setInitialValues(next);

      notifications.show({
        title: "Profile updated",
        message: "Your profile information has been saved successfully.",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Update failed",
        message: "Unable to save profile changes right now.",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialValues) form.setValues(initialValues);
  };

  const { name, email, image, role } = form.values;

  const isDirty = useMemo(
    () => !!initialValues && (initialValues.name !== name || initialValues.email !== email || initialValues.image !== image),
    [initialValues, name, email, image]
  );

  const displayName = name.trim() || "Your Name";
  const displayEmail = email.trim() || "Email not available";
  const displayRole = role ? role.replaceAll("_", " ").toLowerCase() : "";
  const avatarFallback = (name || email || "?").trim().charAt(0).toUpperCase();

  if (status === "loading") {
    return (
      <PageLayout>
        <LoadingOverlay visible style={{ minHeight: 300 }} />
      </PageLayout>
    );
  }
  if (status === "unauthenticated") return null;

  return (
    <PageLayout>
      <Stack gap="lg" maw={720} mx="auto">
        <Group align="flex-start" gap="md">
          <Icon icon="mdi:account-circle" width={32} height={32} />
          <div>
            <Title order={2}>Profile</Title>
            <Text c="dimmed">Manage your personal details and profile avatar.</Text>
          </div>
        </Group>

        <Card withBorder p="xl" radius="md" shadow="sm">
          <LoadingOverlay visible={loading || saving} overlayProps={{ blur: 2 }} />
          <Stack gap="lg">
            <Group align="center" gap="md">
              <Avatar size={72} radius="xl" src={image || undefined}>
                {avatarFallback}
              </Avatar>
              <div>
                <Title order={3} size="h4">
                  {displayName}
                </Title>
                <Group gap="xs">
                  <Text size="sm" c="dimmed">
                    {displayEmail}
                  </Text>
                  {displayRole && (
                    <Badge size="sm" variant="light" color="blue" tt="capitalize">
                      {displayRole}
                    </Badge>
                  )}
                </Group>
              </div>
            </Group>

            <Divider />

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  leftSection={<Icon icon="mdi:account" width={16} height={16} />}
                  withAsterisk
                  {...form.getInputProps("name")}
                />
                <TextInput
                  label="Email"
                  placeholder="email@example.com"
                  leftSection={<Icon icon="mdi:email" width={16} height={16} />}
                  withAsterisk
                  {...form.getInputProps("email")}
                />
                <TextInput
                  label="Avatar URL"
                  description="Use an absolute URL or a path that starts with /"
                  placeholder="https://example.com/avatar.png"
                  leftSection={<Icon icon="mdi:image" width={16} height={16} />}
                  {...form.getInputProps("image")}
                />

                <Group justify="flex-end" gap="sm">
                  <Button
                    variant="default"
                    type="button"
                    leftSection={<Icon icon="mdi:backup-restore" width={16} height={16} />}
                    onClick={handleReset}
                    disabled={!isDirty || loading || saving}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    leftSection={<Icon icon="mdi:content-save" width={16} height={16} />}
                    loading={saving}
                    disabled={!isDirty}
                  >
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Card>
      </Stack>
    </PageLayout>
  );
}
