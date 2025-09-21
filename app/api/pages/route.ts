import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import matter from "gray-matter";
import { readAllPages } from "@/lib/content";

export async function GET() {
  try {
    const pages = await readAllPages();
    return NextResponse.json(pages);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();
    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const fileName = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const filePath = path.join(
      process.cwd(),
      "content",
      "posts",
      `${fileName}.md`,
    );
    try {
      await fs.access(filePath);
      return NextResponse.json(
        { error: "File already exists" },
        { status: 409 },
      );
    } catch {
    }

    const now = new Date();
    const frontmatter = {
      title: title,
      description: "",
      tags: [],
      created: now.toISOString().split("T")[0],
      updated: now.toISOString().split("T")[0],
    };
    const defaultContent = `# ${title}
    
    Start Writing your content here ...`;
    const fileContent = matter.stringify(defaultContent, frontmatter);
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    await fs.writeFile(filePath, fileContent, "utf-8");
    return NextResponse.json({
      success: true,
      filename: fileName,
      slug: fileName,
    });
  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json(
      { error: "Failed to create new page" },
      { status: 500 },
    );
  }
}
