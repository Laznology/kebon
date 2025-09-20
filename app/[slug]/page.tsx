import Editor from '@/components/editor/Editor'
import { readMarkdown } from '@/lib/content'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { content, frontmatter } = await readMarkdown(slug)
    return (
        <div>
            <Editor
                slug={slug}
                initialMarkdown={content}
                initialFrontmatter={frontmatter}
            />
        </div>
    )
}
