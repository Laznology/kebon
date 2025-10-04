"use client";

import {
  Table,
  Badge,
  Group,
  ActionIcon,
  Text,
  LoadingOverlay,
  Stack,
  Box,
  Popover,
  Button,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import { Icon } from "@iconify/react";
import { useMediaQuery } from "@mantine/hooks";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [openedPopoverId, setOpenedPopoverId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data.data || []);
        } else {
          throw new Error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load users",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleDelete = async (id: string, userName: string) => {
    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setUsers((prev) => prev.filter((user) => user.id !== id));
        notifications.show({
          title: "Success",
          message: `User "${userName}" has been deleted`,
          color: "green",
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        notifications.show({
          title: "Cannot Delete User",
          message: errorData.details,
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete user",
        color: "red",
      });
    }
  };

  const isCurrentUserAdmin = session?.user?.role === "ADMIN";

  if (loading) {
    return (
      <div style={{ position: "relative", minHeight: 200 }}>
        <LoadingOverlay visible />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Stack align="center" py="xl">
        <Icon
          icon="mdi:account-off"
          width={48}
          height={48}
          style={{ opacity: 0.5 }}
        />
        <Text c="dimmed">No users found</Text>
      </Stack>
    );
  }

  const rows = users.map((user) => (
    <Table.Tr key={user.id}>
      <Table.Td>
        <div>
          <Text size="sm" fw={500}>
            {user.email}
          </Text>
          <Text size="xs" c="dimmed">
            {user.name || "No name"}
          </Text>
        </div>
      </Table.Td>
      <Table.Td>
        <Badge
          color={user.role === "ADMIN" ? "red" : "blue"}
          variant="light"
          leftSection={
            <Icon
              icon={user.role === "ADMIN" ? "mdi:shield-crown" : "mdi:account"}
              width={12}
              height={12}
            />
          }
          size={isMobile ? "xs" : "sm"}
        >
          {user.role}
        </Badge>
      </Table.Td>
      {!isMobile && (
        <Table.Td>
          <Text size="sm" c="dimmed">
            {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </Table.Td>
      )}
      <Table.Td>
        <Group gap="xs">
          {isCurrentUserAdmin &&
            user.role !== "ADMIN" &&
            user.id !== session?.user?.id && (
              <Popover
                width={200}
                position="bottom"
                withArrow
                shadow="md"
                opened={openedPopoverId === user.id}
                onChange={(opened) =>
                  setOpenedPopoverId(opened ? user.id : null)
                }
              >
                <Popover.Target>
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => setOpenedPopoverId(user.id)}
                    size="sm"
                  >
                    <Icon icon="mdi:delete" width={16} height={16} />
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown>
                  <Text size="sm" mb="xs">
                    Are you sure you want to delete this user?
                  </Text>
                  <Group justify="flex-end">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => setOpenedPopoverId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      onClick={() => {
                        handleDelete(user.id, user.name || user.email);
                        setOpenedPopoverId(null);
                      }}
                    >
                      Delete
                    </Button>
                  </Group>
                </Popover.Dropdown>
              </Popover>
            )}
          {!isCurrentUserAdmin && (
            <Text size="xs" c="dimmed">
              No actions
            </Text>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  if (isMobile) {
    return (
      <Stack gap="md">
        {users.map((user) => (
          <Box
            key={user.id}
            p="md"
            style={{
              border: "1px solid var(--mantine-color-gray-3)",
              borderRadius: "8px",
            }}
          >
            <Group justify="space-between" align="flex-start" mb="xs">
              <div style={{ flex: 1 }}>
                <Group gap="xs" mb="xs">
                  <Icon icon="mdi:account" width={16} height={16} />
                  <Text size="sm" fw={500}>
                    {user.email}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed" mb="xs">
                  {user.name || "No name"}
                </Text>
                <Group gap="md" align="center">
                  <Badge
                    color={user.role === "ADMIN" ? "red" : "blue"}
                    variant="light"
                    leftSection={
                      <Icon
                        icon={
                          user.role === "ADMIN"
                            ? "mdi:shield-crown"
                            : "mdi:account"
                        }
                        width={12}
                        height={12}
                      />
                    }
                    size="xs"
                  >
                    {user.role}
                  </Badge>
                  <Text size="xs" c="dimmed">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </Group>
              </div>
              {isCurrentUserAdmin &&
                user.role !== "ADMIN" &&
                user.id !== session?.user?.id && (
                  <Popover
                    width={200}
                    position="bottom"
                    withArrow
                    shadow="md"
                    opened={openedPopoverId === user.id}
                    onChange={(opened) =>
                      setOpenedPopoverId(opened ? user.id : null)
                    }
                  >
                    <Popover.Target>
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => setOpenedPopoverId(user.id)}
                        size="sm"
                      >
                        <Icon icon="mdi:delete" width={16} height={16} />
                      </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Text size="sm" mb="xs">
                        Are you sure you want to delete this user?
                      </Text>
                      <Group justify="flex-end">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setOpenedPopoverId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          onClick={() => {
                            handleDelete(user.id, user.name || user.email);
                            setOpenedPopoverId(null);
                          }}
                        >
                          Delete
                        </Button>
                      </Group>
                    </Popover.Dropdown>
                  </Popover>
                )}
            </Group>
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Group gap="xs">
                <Icon icon="mdi:account" width={16} height={16} />
                User
              </Group>
            </Table.Th>
            <Table.Th>
              <Group gap="xs">
                <Icon icon="mdi:shield-account" width={16} height={16} />
                Role
              </Group>
            </Table.Th>
            <Table.Th>
              <Group gap="xs">
                <Icon icon="mdi:calendar" width={16} height={16} />
                Created
              </Group>
            </Table.Th>
            <Table.Th>
              <Group gap="xs">
                <Icon icon="mdi:cog" width={16} height={16} />
                Actions
              </Group>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
