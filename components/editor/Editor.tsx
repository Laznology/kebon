"use client";
import React, { useState } from "react";
import {
  EditorRoot,
  EditorContent,
  JSONContent,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  handleCommandNavigation,
  EditorBubble,
  EditorInstance,
} from "novel";
import { defaultExtensions } from "@/lib/extensions";
import { suggestionItems } from "@/components/editor/slash-command";
import { NodeSelector } from "@/components/editor/bubble/node-selector";
import { TextButtons } from "@/components/editor/bubble/text-buttons";
import { ColorSelector } from "@/components/editor/bubble/color-selector";
import { LinkSelector } from "@/components/editor/bubble/link-selector";
import { useSession } from "next-auth/react";

type EditorProps = {
  initialContent?: JSONContent | null;
  onUpdate?: (props: { editor: EditorInstance }) => void;
  onCreate?: (props: { editor: EditorInstance }) => void;
  contentKey?: string;
  className?: string;
};

export default function Editor({
  initialContent,
  onUpdate,
  onCreate,
  contentKey,
  className,
}: EditorProps) {
  const [openNode, setOpenNode] = useState<boolean>(false);
  const [openColor, setOpenColor] = useState<boolean>(false);
  const [openLink, setOpenLink] = useState<boolean>(false);

  const { data: session } = useSession();

  return (
    <EditorRoot>
      <EditorContent
        editable={!!session}
        key={contentKey}
        initialContent={initialContent || undefined}
        extensions={defaultExtensions}
        className={
          className ||
          "relative min-h-[600px] w-full transition-all duration-200 "
        }
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event),
          },
          attributes: {
            class:
              "py-12 prose prose-base dark:prose-invert focus:outline-none max-w-full min-h-[500px]",
          },
        }}
        onUpdate={onUpdate}
        onCreate={onCreate}
      >
        <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto bg-white dark:bg-gray-900 px-1 py-2  transition-all">
          <EditorCommandEmpty className="px-2 text-gray-500 dark:text-gray-400">
            No results
          </EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val) => item.command && item.command(val)}
                className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 aria-selected:bg-blue-50 dark:aria-selected:bg-blue-900 cursor-pointer transition-colors"
                key={item.title}
              >
                <div className="flex h-10 w-10 items-center justify-center bg-white dark:bg-gray-800">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>

        <EditorBubble
          tippyOptions={{
            placement: "top-start",
            zIndex: 9999,
          }}
          className="flex w-fit overflow-visible rounded border border-border bg-popover shadow-xl z-[9999]"
        >
          <LinkSelector open={openLink} onOpenChange={setOpenLink} />
          <NodeSelector open={openNode} onOpenChange={setOpenNode} />
          <TextButtons />
          <ColorSelector open={openColor} onOpenChange={setOpenColor} />
        </EditorBubble>
      </EditorContent>
    </EditorRoot>
  );
}
