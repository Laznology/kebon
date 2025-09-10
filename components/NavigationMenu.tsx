"use client";
import React from "react";
import { ScrollArea, NavLink, Group } from "@mantine/core";
import Link from "next/link";
import { useAllDocuments } from "@/hooks/useAllDocuments";
import { usePathname } from "next/navigation";

export default function NavigationMenu() {
  const { documents } = useAllDocuments();
  const pathname = usePathname();

  const items = documents ?? [];

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1" scrollbarSize={6} type="hover">
        <div className="px-2 pb-8 flex flex-col gap-1">
          {items.map((page) => {
            const href = `/${page.slug ?? ""}`.replace(/\/{2,}/g, "/");
            const active = pathname === href;

            return (
              <NavLink
                key={page.id}
                component={Link}
                href={href}
                label={
                  <Group gap="xs" wrap="nowrap">
                    <span className="truncate">{page.title}</span>
                  </Group>
                }
                active={active}
                className="rounded-xl"
                classNames={{
                  root: "transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
                  label: "text-sm",
                }}
              />
            );
          })}

          {items.length === 0 && (
            <div className="px-3 py-6 text-sm text-gray-500">
              No pages found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
