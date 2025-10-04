import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Box, Group, Text } from "@mantine/core";
import cx from "clsx";
import classes from "./TableOfContents.module.css";
import { Icon } from "@iconify/react";
interface TocItem {
  id: string;
  value: string;
  depth: number;
}

interface TableOfContentsProps {
  tocItems: TocItem[];
  reinitializeRef?: React.MutableRefObject<() => void>;
  minDepthToOffset?: number;
  depthOffset?: number;
}

export function TableOfContents({
  tocItems,
  reinitializeRef,
  minDepthToOffset = 1,
  depthOffset = 40,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const items = useMemo(() => tocItems ?? [], [tocItems]);

  const initObserver = useCallback(() => {
    observerRef.current?.disconnect();

    const headings = items
      .map((i) =>
        document.querySelector<HTMLElement>(`[data-heading-id="${i.id}"]`),
      )
      .filter(Boolean) as HTMLElement[];

    if (headings.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop,
          );

        if (visible[0]) {
          const id = (visible[0].target as HTMLElement).getAttribute(
            "data-heading-id",
          );
          if (id) setActiveId(id);
        } else {
          const scrollY = window.scrollY + 1;
          let current: string | null = null;
          for (const el of headings) {
            if (el.offsetTop <= scrollY)
              current = el.getAttribute("data-heading-id");
          }
          if (current) setActiveId(current);
        }
      },
      {
        rootMargin: `-${depthOffset}px 0px -60% 0px`,
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    headings.forEach((el) => observerRef.current!.observe(el));
  }, [items, depthOffset]);

  useEffect(() => {
    initObserver();
    return () => observerRef.current?.disconnect();
  }, [initObserver]);

  useEffect(() => {
    if (reinitializeRef) {
      reinitializeRef.current = () => {
        initObserver();
      };
    }
  }, [reinitializeRef, initObserver]);

  if (!items.length) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">
        <Text size="sm">No headings found</Text>
      </div>
    );
  }

  return (
    <div>
      <Group mb="md" gap="xs">
        <Icon icon={"hugeicons:search-list-02"} width={20} height={20} />
        <Text size="sm" fw={600}>
          Table of contents
        </Text>
      </Group>

      {items.map((item) => {
        const indentUnits = Math.max(0, item.depth - minDepthToOffset + 1);
        return (
          <Box<"a">
            key={item.id}
            component="a"
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              const el = document.querySelector<HTMLElement>(
                `[data-heading-id="${item.id}"]`,
              );
              if (el) {
                el.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                  inline: "nearest",
                });
              }
            }}
            className={cx(classes.link, {
              [classes.linkActive]: activeId === item.id,
            })}
            style={{
              paddingLeft: `calc(${indentUnits} * var(--mantine-spacing-md))`,
            }}
          >
            {item.value}
          </Box>
        );
      })}
    </div>
  );
}
