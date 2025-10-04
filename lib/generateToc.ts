import { JSONContent } from "@tiptap/react";
type TocItem = {
  id: string;
  value: string;
  depth: number;
};

import { slugifyHeading } from "@/lib/toc";

export function generateTocFromContent(data: JSONContent): TocItem[] {
  const headings: TocItem[] = [];

  if (!data || !data.content) {
    return headings;
  }

  const processNode = (node: JSONContent) => {
    if (node.type === "heading" && node.attrs?.level && node.content) {
      const depth = node.attrs.level;
      const title = node.content
        ?.map((child) => child.text)
        .join(" ")
        .trim();

      if (title) {
        const id = node.attrs.id || slugifyHeading(title);
        headings.push({
          id: id,
          value: title,
          depth: depth,
        });
      }
    }

    if (node.content) {
      node.content.forEach((child) => {
        processNode(child);
      });
    }
  };

  data.content.forEach((node) => {
    processNode(node);
  });

  return headings;
}
