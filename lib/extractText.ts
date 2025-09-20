import { JSONContent } from "@tiptap/react";

type ContentNode = JSONContent | JSONContent[];

export function extractPlainText(node: ContentNode): string {
  if (!node) return "";

  if (Array.isArray(node)) {
    return node.map(extractPlainText).join("");
  }

  if (node.type === "text" && typeof node.text === "string") {
    return node.text;
  }

  if (node.content && Array.isArray(node.content)) {
    return extractPlainText(node.content);
  }

  return "";
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_]{1,3}/g, "")
    .replace(/>\s?/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\r?\n+/g, " ");
}

export function extractAndCleanText(
  content: JSONContent | string | null | undefined,
): string {
  if (!content) return "";

  const text =
    typeof content === "string" ? stripMarkdown(content) : extractPlainText(content);

  return text.replace(/\s+/g, " ").trim();
}
