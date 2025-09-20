import { NextRequest, NextResponse } from "next/server";
import { readMarkdown, writeMarkdown } from "@/lib/content";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> } 
) {
  const { slug } = await context.params;
  if (!slug) {
    return new NextResponse('Bad Request: slug is required', { status: 400 });
  }

  try {
    const { frontmatter, content } = await readMarkdown(slug);
    
    return NextResponse.json({
      slug,
      title: frontmatter.title || slug.replace(/-/g, " "),
      content,
      frontmatter,
      updatedAt: frontmatter.updatedAt || new Date().toISOString(),
      author: frontmatter.author || null,
    });
  } catch {
    return NextResponse.json({
      slug,
      title: slug.replace(/-/g, " "),
      content: `# ${slug.replace(/-/g, " ")}\n\nStart writing your content here...`,
      frontmatter: { 
        title: slug.replace(/-/g, " "),
        updatedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString(),
      author: null,
    });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  if (!slug) {
    return new NextResponse('Bad Request: slug is required', { status: 400 });
  }

  try {
    const body = await request.json();
    const { content, frontmatter: customFrontmatter } = body;
    
    const frontmatter = {
      title: customFrontmatter?.title || slug.replace(/-/g, " "),
      updatedAt: new Date().toISOString(),
      ...customFrontmatter,
    };
    
    await writeMarkdown(slug, frontmatter, content);
    
    return NextResponse.json({
      slug,
      title: frontmatter.title,
      content,
      frontmatter,
      updatedAt: frontmatter.updatedAt,
      message: "Document saved successfully"
    });
  } catch (error) {
    console.error("Error saving document:", error);
    return NextResponse.json(
      { error: "Failed to save document" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  if (!slug) {
    return new NextResponse('Bad Request: slug is required', { status: 400 });
  }

  try {
    const body = await request.json();
    const { content, title, frontmatter: customFrontmatter } = body;
    
    const frontmatter = {
      title: title || slug.replace(/-/g, " "),
      updatedAt: new Date().toISOString(),
      ...customFrontmatter,
    };
    
    await writeMarkdown(slug, frontmatter, content);
    
    return NextResponse.json({
      slug,
      title: frontmatter.title,
      content,
      frontmatter,
      updatedAt: frontmatter.updatedAt,
    });
  } catch (error) {
    console.error("Error saving document:", error);
    return NextResponse.json(
      { error: "Failed to save document" },
      { status: 500 }
    );
  }
}
