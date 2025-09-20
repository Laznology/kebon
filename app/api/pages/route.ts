import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import path from "path";
import fs from "fs/promises";

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts')

export async function GET() {
  try {
    const files = await fs.readdir(CONTENT_DIR)
    const markdownFiles = files.filter((file) => file.endsWith('.md'))
    const pages = await Promise.all(
      markdownFiles.map(async (file) => {
        const slug = file.replace(/\.md$/,"")
        const filePath = path.join(CONTENT_DIR, file)
        const content = await fs.readFile(filePath, 'utf-8')
        const  { data: frontmatter, content: markdownContent } = matter(content)
        
        return {
          id: slug,
          slug,
          title: frontmatter.title || slug.replace(/-/g, " "),
          content: markdownContent,
          excerpt: markdownContent.slice(0, 200),
          tags: frontmatter.tags || [],
          created: frontmatter.created,
          updated: frontmatter.updated
        }
      })
    )
    return NextResponse.json(pages)
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
