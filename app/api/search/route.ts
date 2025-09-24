import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractAndCleanText } from "@/lib/extractText";
import type { JSONContent } from "@tiptap/core";

interface PageWithExtras {
  id: string;
  title: string;
  slug: string;
  content: unknown;
  excerpt?: string;
  tags?: string[];
  author: {
    id: string;
    name: string | null;
    email: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const pages = await prisma.page.findMany({
      where: {
        isDeleted: false,
        published: true,
        title: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
    });

    const allPages = await prisma.page.findMany({
      where: {
        isDeleted: false,
        published: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const contentMatches = allPages.filter((page) => {
      if (!page.content) return false;

      const textContent = extractAndCleanText(page.content as JSONContent);
      return textContent.toLowerCase().includes(query.toLowerCase());
    });

    const allMatches = [...pages, ...contentMatches];
    const uniqueMatches = allMatches.filter(
      (page, index, self) => index === self.findIndex((p) => p.id === page.id),
    );

    const results = uniqueMatches.map((page) => {
      const pageWithExcerpt = page as PageWithExtras;
      return {
        ...page,
        searchScore: calculateSearchScore(pageWithExcerpt, query),
        highlightedTitle: highlightText(page.title, query),
        highlightedExcerpt: pageWithExcerpt.excerpt
          ? highlightText(pageWithExcerpt.excerpt, query)
          : null,
      };
    });

    results.sort((a, b) => b.searchScore - a.searchScore);

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

function calculateSearchScore(page: PageWithExtras, query: string): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();

  if (page.title.toLowerCase().includes(lowerQuery)) {
    score += 10;
  }

  if (
    page.tags &&
    page.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
  ) {
    score += 8;
  }

  if (page.excerpt && page.excerpt.toLowerCase().includes(lowerQuery)) {
    score += 5;
  }

  if (page.content) {
    const textContent = extractAndCleanText(page.content as JSONContent);
    if (textContent.toLowerCase().includes(lowerQuery)) {
      score += 3;
    }
  }

  return score;
}

function highlightText(text: string, query: string): string {
  if (!text || !query) return text;

  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}
