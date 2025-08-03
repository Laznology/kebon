'use client'
import { useState, useEffect } from "react";
import { Document } from "@/types/document";

export default function DocsPage({ params }: { params: { slug: string }}) {
    const [document, setDocument] = useState<Document | null>(null);
    
    return (
        <div></div>
    )
}