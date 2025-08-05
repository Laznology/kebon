import { JSONContent } from "novel";

export interface BaseDocument {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    content: JSONContent;
    createdAt: string;
    updatedAt: string;
}

export interface DocumentAuthor {
    authorId: string | null;
    author?: {
        id: string;
        email: string;
        name?: string;
    };
}

export interface DocumentVersion {
    id: string;
    content: JSONContent | null;
    documentId: string;
    document: Document;
    createdAt: string;
    updatedAt: string;
}

export interface Document extends BaseDocument, DocumentAuthor {
    documentVersion: DocumentVersion[]
}
