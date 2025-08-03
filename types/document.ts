export interface Document{
    id: string,
    title: string,
    slug: string,
    published: boolean,
    content: Record<string, any>,
    authorId: string,
    documentVersions: any[],
    createdAt: string,
    updatedAt: string
}