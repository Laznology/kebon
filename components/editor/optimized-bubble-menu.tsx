"use client";

import React from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import { NodeSelector } from "@/components/editor/bubble/node-selector";
import { TextButtons } from "@/components/editor/bubble/text-buttons";
import { ColorSelector } from "@/components/editor/bubble/color-selector";
import { LinkSelector } from "@/components/editor/bubble/link-selector";
import type { Editor } from "@tiptap/react";

interface OptimizedBubbleMenuProps {
  editor: Editor;
  openNode: boolean;
  setOpenNode: (open: boolean) => void;
  openColor: boolean;
  setOpenColor: (open: boolean) => void;
  openLink: boolean;
  setOpenLink: (open: boolean) => void;
}

export function OptimizedBubbleMenu({
  editor,
  openNode,
  setOpenNode,
  openColor,
  setOpenColor,
  openLink,
  setOpenLink,
}: OptimizedBubbleMenuProps) {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: "bottom",
        flip: false,
        shift: true,
        offset: 8,
        strategy: "absolute",
      }}
    >
      <div className="flex rounded border border-border bg-[rgb(var(--background))] shadow-xl">
        <LinkSelector
          open={openLink}
          onOpenChange={setOpenLink}
          editor={editor}
        />
        <NodeSelector
          open={openNode}
          onOpenChange={setOpenNode}
          editor={editor}
        />
        <TextButtons editor={editor} />
        <ColorSelector
          open={openColor}
          onOpenChange={setOpenColor}
          editor={editor}
        />
      </div>
    </BubbleMenu>
  );
}
