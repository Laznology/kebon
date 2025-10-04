"use client";

import dynamic from "next/dynamic";
import type { JSONContent } from "@tiptap/core";

const DemoEditor = dynamic(() => import("@/components/editor/demo-editor"), {
  ssr: false,
});

const demoContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Welcome to the Demo Editor!" }],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This is a demo of the Notion-style editor. You can look around, but you can't save any changes.",
        },
      ],
    },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Try typing '/' to see the available commands.",
        },
      ],
    },
  ],
};

export default function DemoPage() {
  return (
    <div className="p-8">
      <DemoEditor initialContent={demoContent} />
    </div>
  );
}
