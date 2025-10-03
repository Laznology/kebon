"use client";
import { Box, Text, Group, Anchor } from "@mantine/core";
import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <Box component="footer" className="bg-transparent">
      <Box className="container mx-auto px-4 py-4 md:px-8 lg:px-10">
        <Group justify="center" gap="xs" mb="xs">
          <Text size="sm" c="dimmed" ta="center">
            Powered by{" "}
            <Anchor
              href="https://github.com/Laznology/kebon" 
              target="_blank"
              rel="noopener noreferrer"
              c="dimmed"
              fw={700}
            >
              Kebon
            </Anchor> v0.1.0
          </Text>
        </Group>
      </Box>
    </Box>
  );
}
