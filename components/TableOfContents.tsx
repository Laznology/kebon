import { Icon } from "@iconify/react";
import { Group, Text } from "@mantine/core";
import { TableOfContents as MantineTableOfContents } from "@mantine/core";
import classes from "./TableOfContents.module.css";

interface TocItem {
  id: string;
  value: string;
  depth: number;
}

interface TableOfContentsProps {
  tocItems: TocItem[];
  reinitializeRef?: React.MutableRefObject<() => void>;
}

export function TableOfContents({ tocItems, reinitializeRef }: TableOfContentsProps) {
  if (tocItems.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">
        <Icon icon="mdi:format-list-bulleted" width={24} height={24} className="mx-auto mb-2 opacity-50" />
        <Text size="sm">No headings found</Text>
      </div>
    );
  }

  return (
    <div>
      <Group mb="md" gap="xs">
        <Icon icon="mdi:format-list-bulleted" width={18} height={18} />
        <Text size="sm" fw={600}>
          Table of contents
        </Text>
      </Group>
      
      <MantineTableOfContents
        variant="none"
        size="sm"
        minDepthToOffset={0}
        depthOffset={16}
        reinitializeRef={reinitializeRef}
        initialData={tocItems}
        classNames={{
          root: classes.root,
          control: classes.control,
        }}
        scrollSpyOptions={{
          selector: "[data-heading-id]",
          getDepth: (element) => Number(element.getAttribute("data-depth")),
          getValue: (element) => element.getAttribute("data-heading-text") || "",
        }}
        getControlProps={({ data, active }) => ({
          onClick: () => {
            const element = document.querySelector(
              `[data-heading-id="${data.id}"]`,
            );
            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "start",
                inline: "nearest",
              });
            }
          },
          className: `${classes.link} ${active ? classes.linkActive : ""}`,
          children: data.value,
        })}
      />
    </div>
  );
}
