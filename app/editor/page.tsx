"use client";

import { EditorContent, EditorRoot, JSONContent } from "novel";
import { useState } from "react";
import { defaultExtensions } from "@/lib/extensions";
import { handleCommandNavigation } from "novel";

export default function EditrPage() {
  const [content, setContent] = useState<JSONContent>({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Hello, world!" }],
      },
    ],
  });
  const extensions = [...defaultExtensions];

  return (
    <EditorRoot>
      <EditorContent
        className="prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full"
        extensions={extensions}
        initialContent={content}
        onUpdate={setContent}
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
        }}
      />
    </EditorRoot>
  );
}