'use client'
import { useState, useEffect } from "react"
import { Card, Image, Text, Badge, Button, Group } from '@mantine/core';
import { Document } from "@/types/document"

export default function DashboardPage() {
    const [data, setData] = useState<Document[]>()
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true)
                const response = await fetch('/api/documents')
                const reslut = await response.json()
                setData(reslut)
            } catch (error) {
                console.error
            } finally {
                setLoading(false)
            }
        }
        fetchDocuments()
    }, [])

    if(loading) return <p>Loading ...</p>

    if(!data) return <p>No documents found.</p>

    return (
        <div className="flex">
            <div className="flex justify-between items-center mb-4 gap-4">
                {data.map((doc) => (
                    <Card key={doc.id} shadow="sm" padding="lg" radius="md" withBorder>
                        <Card.Section>
                            <Image
                                src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
                                height={160}
                                alt={doc.title}
                            />
                        </Card.Section>

                        <Group justify="space-between" mt="md" mb="xs">
                            <Text fw={500}>{doc.title}</Text>
                            <Badge color={doc.published ? "green" : "gray"}>
                                {doc.published ? "Published" : "Draft"}
                            </Badge>
                        </Group>

                        <Text size="sm" c="dimmed">
                            {doc.content.blocks?.[0]?.data?.text || "No content available"}
                        </Text>

                        <Button color="blue" fullWidth mt="md" radius="md">
                            View Document
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    )
}