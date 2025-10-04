export type TocItem = {
  id: string;
  value: string;
  depth: number;
};

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function generateTocFromMarkdown(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const tocItems: TocItem[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;

    const depth = match[1].length;
    const value = match[2].trim();
    const id = slugifyHeading(value);

    tocItems.push({
      id,
      value,
      depth,
    });
  }

  return tocItems;
}
