"use client";
import { ScrollArea } from "@mantine/core";
import Link from "next/link";
import { useAllDocuments } from "@/hooks/useAllDocuments";

export default function NavigationMenu() {
  const { documents } = useAllDocuments();

  const renderContent = () => {
    if (documents) {
      return (
        <div className={"flex flex-col gap-0 px-4"}>
          {documents.map((page) => (
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
