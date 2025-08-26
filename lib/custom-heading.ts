import { Heading } from '@tiptap/extension-heading'
import { cx } from "class-variance-authority";

export const CustomHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level;
    const content = node.textContent || '';
    const id = `heading-${content.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    
    return [
      `h${level}`,
      {
        ...HTMLAttributes,
        id: id,
        'data-heading-id': id,
        'data-depth': level,
        'data-heading-text': content,
        class: cx("scroll-m-20 tracking-tight font-semibold"),
      },
      0,
    ];
  },
}).configure({
  levels: [1, 2, 3, 4, 5, 6],
});
