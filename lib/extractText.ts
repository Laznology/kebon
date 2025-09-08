import { JSONContent } from "novel";

export function extractPlainText(node: JSONContent): string {
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

export function extractAndCleanText(content: JSONContent) {
  const text = extractPlainText(content);
  return text.replace(/\s+/g, " ").trim();
}
