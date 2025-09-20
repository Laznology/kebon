import {
  CheckSquare,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  TextQuote,
  Link,
  SeparatorHorizontal
} from "lucide-react";
import { Extension, Range } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { showImageUrlDialog } from "@/lib/image-dialog-utils";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Editor as TiptapEditor } from '@tiptap/react';

interface SuggestionItem {
  title: string;
  description: string;
  searchTerms: string[];
  icon: React.ReactNode;
  command: (params: { editor: TiptapEditor; range: Range }) => void;
}

interface CommandListProps {
  items: SuggestionItem[];
  command: (item: SuggestionItem) => void;
}

interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const CommandList = forwardRef<CommandListRef, CommandListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="z-50 h-auto max-h-[330px] overflow-y-auto bg-[hsl(var(--background))] border border-border rounded-md px-1 py-2 shadow-md transition-all">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent text-foreground cursor-pointer transition-colors ${
              index === selectedIndex ? 'bg-accent' : ''
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <div className="flex h-10 w-10 items-center justify-center bg-muted rounded-md">
              {item.icon}
            </div>
            <div>
              <p className="font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </button>
        ))
      ) : (
        <div className="px-2 text-muted-foreground">No results</div>
      )}
    </div>
  );
});

CommandList.displayName = 'CommandList';

export const suggestionItems: SuggestionItem[] = [
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={18} />,
    command: ({ editor, range }: { editor: TiptapEditor; range: Range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with a to-do list.",
    searchTerms: ["todo", "task", "list", "check", "checkbox"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }: { editor: TiptapEditor; range: Range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
  },
  {
    title: "Separator",
    description: "",
    searchTerms: ["horizontal, divider"],
    icon: <SeparatorHorizontal size={18} />,
    command: ({ editor }) => editor.chain().focus().setHorizontalRule().run()
  },

  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: <Code size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Image from URL",
    description: "Embed an image from an external link.",
    searchTerms: ["photo", "picture", "media", "url", "link", "external"],
    icon: <Link size={18} />,
    command: async ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      
      const result = await showImageUrlDialog();
      if (result) {
        editor.chain().focus().insertContent(`<img src="${result.url}" alt="${result.alt}" title="${result.title}" />`).run();
      }
    },
  },
];

export const slashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: TiptapEditor; range: Range; props: SuggestionItem }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }) => {
          return suggestionItems.filter(item => {
            if (typeof query === 'string' && query.length > 0) {
              const search = query.toLowerCase();
              return (
                item.title.toLowerCase().includes(search) ||
                item.description.toLowerCase().includes(search) ||
                (item.searchTerms && item.searchTerms.some(term => term.toLowerCase().includes(search)))
              );
            }
            return suggestionItems;
          });
        },
        render: () => {
          let component: ReactRenderer;
          let popup: ReturnType<typeof tippy> extends Array<infer T> ? T : ReturnType<typeof tippy>;

          return {
            onStart: (props) => {
              component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              const instances = tippy(document.body, {
                getReferenceClientRect: () => props.clientRect?.() || new DOMRect(),
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
              
              popup = Array.isArray(instances) ? instances[0] : instances;
            },

            onUpdate(props) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup.setProps({
                getReferenceClientRect: () => props.clientRect?.() || new DOMRect(),
              });
            },

            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup.hide();
                return true;
              }

              return (component.ref as CommandListRef)?.onKeyDown(props);
            },

            onExit() {
              popup.destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});
