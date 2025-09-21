import { Heading } from "@tiptap/extension-heading";
import { cx } from "class-variance-authority";

import { slugifyHeading } from "@/lib/toc";

export const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level;
    const content = node.textContent || "";
    const slug = node.attrs.id || slugifyHeading(content);

    return [
      `h${level}`,
      {
        ...HTMLAttributes,
        id: slug,
        "data-heading-id": slug,
        "data-depth": level,
        "data-heading-text": content,
        class: cx("tracking-tight font-bold", HTMLAttributes?.class),
      },
      0,
    ];
  },
}).configure({
  levels: [1, 2, 3, 4, 5, 6],
});
