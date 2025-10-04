import { prisma } from "@/lib/prisma";
import type { DatabasePage, PageSummary } from "@/types/page";
import type { JSONContent } from "@tiptap/core";
import { extractAndCleanText } from "@/lib/extractText";

export async function getPageBySlug(
  slug: string,
): Promise<DatabasePage | null> {
  try {
    const page = await prisma.page.findUnique({
      where: {
        slug: slug,
        isDeleted: false,
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

    return page as unknown as DatabasePage | null;
  } catch {
    return null;
  }
}

export async function getAllPublishedPages(): Promise<DatabasePage[]> {
  try {
    const pages = await prisma.page.findMany({
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
      orderBy: {
        updatedAt: "desc",
      },
    });

    return pages as unknown as DatabasePage[];
  } catch {
    return [];
  }
}

export async function getPublishedPageSummaries(): Promise<PageSummary[]> {
  try {
    const pages = await prisma.page.findMany({
      where: {
        isDeleted: false,
        published: true,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        published: true,
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
    });

    return pages as PageSummary[];
  } catch {
    return [];
  }
}

export async function getAllPages(authorId?: string): Promise<DatabasePage[]> {
  try {
    const pages = await prisma.page.findMany({
      where: {
        isDeleted: false,
        ...(authorId && { authorId }),
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
    });

    return pages as unknown as DatabasePage[];
  } catch {
    return [];
  }
}

export async function createPage(
  title: string,
  authorId: string,
  content?: JSONContent,
): Promise<DatabasePage | null> {
  try {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const defaultContent: JSONContent = content || {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: title }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Start writing your content here..." },
          ],
        },
      ],
    };

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content: defaultContent,
        published: false,
        authorId,
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

    return page as unknown as DatabasePage | null;
  } catch {
    return null;
  }
}

export async function updatePage(
  id: string,
  data: {
    title?: string;
    content?: JSONContent;
    tags?: string[];
    published?: boolean;
    image?: string;
  },
): Promise<DatabasePage | null> {
  try {
    const updateData: Partial<{
      title: string;
      content: JSONContent;
      tags: string[];
      published: boolean;
      image: string;
      excerpt: string | null;
    }> = { ...data };

    if (data.content) {
      const excerpt = extractAndCleanText(data.content).slice(0, 200);
      updateData.excerpt = excerpt || null;
    }

    const page = await prisma.page.update({
      where: { id },
      data: updateData,
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

    return page as unknown as DatabasePage | null;
  } catch {
    return null;
  }
}

export async function deletePage(id: string): Promise<boolean> {
  try {
    await prisma.page.update({
      where: { id },
      data: { isDeleted: true },
    });
    return true;
  } catch {
    return false;
  }
}

export async function readAllPages() {
  return getAllPublishedPages();
}

export async function readHomePage() {
  const homePage = await getPageBySlug("index");

  if (!homePage) return null;

  return {
    frontmatter: {
      title: homePage.title,
      updatedAt: homePage.updatedAt.toISOString(),
    },
    content: extractAndCleanText(homePage.content as JSONContent),
  };
}
