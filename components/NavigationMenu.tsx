"use client";
import { Page } from "@/types/page";
import { useFetch } from "@mantine/hooks";
import { Skeleton, ScrollArea } from "@mantine/core";
import Link from "next/link";

export default function NavigationMenu() {
  const { data, loading, error } = useFetch<Page[]>("/api/pages");

  const renderContent = () => {
    if (loading) {
      return (
        <div className={"flex flex-col md:flex-row gap-4"}>
          <Skeleton height={32} radius="md" />
        </div>
      );
    }

    if (error) {
      return <p>Error fetching data</p>;
    }

    if (data) {
      return (
        <div className={"flex flex-col gap-0 px-4"}>
          {data.map((page) => (
            <div
              key={page.id}
              className={
                "cursor-pointer w-full justify-start :darkhover:bg-gray-900 hover:bg-gray-200 transition-all duration-300"
              }
            >
              <Link href={`${page.slug}`}>
                <span className={"cursor-pointer font-normal  w-full"}>
                  {page.title}
                </span>
              </Link>
            </div>
          ))}
        </div>
      );
    }
  };
  return <ScrollArea h="100%">{renderContent()}</ScrollArea>;
}
