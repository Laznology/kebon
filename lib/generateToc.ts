import {JSONContent} from "novel";
type TocItem = {
    id: string;
    value: string;
    depth: number;
}

export function generateTocFromContent(data: JSONContent): TocItem[] {
    const headings: TocItem[] = [];

    if (!data || !data.content) {
        return headings;
    }

    const processNode = (node: JSONContent, index: number) => {
        if(node.type === "heading" && node.attrs?.level && node.content) {
           const depth = node.attrs.level
           const title = node.content?.map(child => child.text).join(" ").trim()

           if (title) {
            const id = `heading-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`
            headings.push({
                id: id,
                value: title,
                depth: depth,
            })
           }
        }

        if (node.content) {
            node.content.forEach((child, childIndex) => {
                processNode(child, childIndex * 1000 + childIndex)
            })
        }

    }

    data.content.forEach((node, index) => {
        processNode(node, index)
    })

    return headings
}