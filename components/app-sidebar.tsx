import { AppShell, Group, Stack } from "@mantine/core";

export function AppSidebar() {
  return (
    <AppShell.Navbar p="md">
      <AppShell.Section>
        {/* Header content */}
      </AppShell.Section>
      <AppShell.Section grow>
        <Stack gap="md">
          {/* Main content groups */}
          <Group>
            {/* Group 1 content */}
          </Group>
          <Group>
            {/* Group 2 content */}
          </Group>
        </Stack>
      </AppShell.Section>
      <AppShell.Section>
        {/* Footer content */}
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
