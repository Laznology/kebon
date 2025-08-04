export interface Document{
    id: string,
    title: string,
    slug: string,
    published: boolean,
    content: Record<string, any>,
    author: Author | null,
    documentVersions: any[],
    createdAt: string,
    updatedAt: string
}

interface Author {
    id: string,
    name: string | null,
    email: string | null,
}