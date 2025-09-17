import {
  AIHighlight,
  CharacterCount,
  CodeBlockLowlight,
  Color,
  CustomKeymap,
  GlobalDragHandle,
  HighlightExtension,
  HorizontalRule,
  Mathematics,
  Placeholder,
  TaskItem,
  TaskList,
  TextStyle,
  TiptapImage,
  TiptapLink,
  TiptapUnderline,
  Twitter,
  UpdatedImage,
  UploadImagesPlugin,
  Youtube,
  StarterKit,
} from "novel";

import { slashCommand } from "@/components/editor/slash-command";
import { CustomHeading } from "@/lib/custom-heading";
import { showImageUrlDialog } from "@/lib/image-dialog-utils";

import { cx } from "class-variance-authority";
import { common, createLowlight } from "lowlight";

const aiHighlight = AIHighlight;
const placeholder = Placeholder;
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    ),
  },
});

const tiptapImage = TiptapImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cx("opacity-40 rounded-lg border border-stone-200"),
      }),
    ];
  },
}).configure({
  allowBase64: true,
  inline: false,
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted max-w-full h-auto"),
  },
});

const updatedImage = UpdatedImage.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2 "),
  },
});
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex gap-2 items-start"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("mt-4 mb-6 border-t border-muted-foreground"),
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx("list-disc list-outside leading-normal ml-6"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-normal ml-6"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("leading-normal"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-primary pl-4"),
    },
  },
  codeBlock: false,
  code: {
    HTMLAttributes: {
      class: cx(
        "rounded-md bg-muted px-1.5 py-1 font-mono font-medium text-foreground",
        "dark:bg-slate-700 dark:text-slate-200"
      ),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
  paragraph: {
    HTMLAttributes: {
      class: cx("leading-7"),
    },
  },
  heading: false,
});

const codeBlockLowlight = CodeBlockLowlight.configure({
  lowlight: createLowlight(common),
  HTMLAttributes: {
    class: cx(
      "relative rounded-lg bg-slate-800 border border-slate-600 p-4 my-4 overflow-x-auto",
      "dark:bg-slate-900 dark:border-slate-700",
      "not-prose"
    ),
  },
});

const youtube = Youtube.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
  inline: false,
});

const twitter = Twitter.configure({
  HTMLAttributes: {
    class: cx("not-prose"),
  },
  inline: false,
});

const mathematics = Mathematics.configure({
  HTMLAttributes: {
    class: cx("text-foreground rounded p-1 hover:bg-accent cursor-pointer"),
  },
  katexOptions: {
    throwOnError: false,
  },
});

const characterCount = CharacterCount.configure();

const customKeymap = CustomKeymap.configure({
  "Mod-Shift-i": async ({ editor }: { editor: any }) => {
    const result = await showImageUrlDialog();
    if (result) {
      editor.chain().focus().setImage({ 
        src: result.url,
        alt: result.alt,
        title: result.title
      }).run();
    }
    return true;
  },
});

export const defaultExtensions = [
  starterKit,
  CustomHeading,
  placeholder,
  tiptapLink,
  tiptapImage,
  updatedImage,
  taskList,
  taskItem,
  horizontalRule,
  aiHighlight,
  codeBlockLowlight,
  youtube,
  twitter,
  mathematics,
  characterCount,
  TiptapUnderline,
  HighlightExtension,
  TextStyle,
  Color,
  customKeymap,
  GlobalDragHandle,
  slashCommand,
];
