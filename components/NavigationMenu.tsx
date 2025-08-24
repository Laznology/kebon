'use client'
import { Page } from "@/types/page";
import { useFetch } from "@mantine/hooks";
import { Skeleton} from "@/components/ui/skeleton";
import {ScrollArea} from "@/components/ui/scroll-area";
import Link from "next/link";


export default function NavigationMenu() {
    const { data, loading, error } = useFetch<Page[]>('/api/pages')

    const renderContent = () => {
        if (loading) {
            return (
                <div className={"flex flex-col md:flex-row gap-4"}>
                    <Skeleton className={"h-8 w-full rounded"} />
                </div>
            )
        }

        if (error) {
            return  (<p>Error fetching data</p>)
        }

        if (data) {
            return (
                <div className={"flex flex-col gap-4"}>
                    {data.map((page) => (
                        <div key={page.id} className={"w-full justify-start"}>
                            <Link href={`${page.slug}`}>
                                <span className={"cursor-pointer font-semibold"}>{page.title}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            )
        }
    }
    return (
        <ScrollArea className={"h-full w-full"}>
            {renderContent()}
        </ScrollArea>
    )
}