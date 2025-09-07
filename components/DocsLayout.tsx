"use client";

import { useState } from "react";
import React from "react";
import NavigationMenu from "./NavigationMenu";
import { Separator } from "./ui/separator";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";

type DocsLayoutProps = {
  children: React.ReactNode;
  toc: React.ReactNode;
};

export default function DocsLayout({ children, toc }: DocsLayoutProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className={"space-y-6"}>
      <nav className={"w-full flex justify-between relative"}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={
            "block md:hidden border rounded p-2 bg-blue text-primary shadow"
          }
        >
          {isOpen ? "Close" : "Open"}
        </button>
      </nav>

      <div
        className={`absolute bg-black/20 border rounded h-auto mx-1 left-0 right-0 px-1 transition-all ease-in-out duration-100 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        } `}
      >
        <div>Menu 1</div>
        <div>menu 2</div>
      </div>

      <div className={"flex flex-col md:flex-row gap-4"}>
        <aside className="min-w-64 border-r space-y-2">
          <Separator />
          <h1 className="text-center text-xl md:text-3xl font-bold">Pages</h1>
          <Separator />
          <Input
            className={
              "outline-0 focus:ring-none focus:border-0 focus:outline-0"
            }
          />
          <NavigationMenu />
          <ThemeToggle />
        </aside>
        <main className={"grpw-1 w-full"}>{children}</main>
        <aside
          className={"px-4 hidden md:block h-full border-l w-full max-w-64"}
        >
          <span>Table of Contents</span>
          {toc}
        </aside>
      </div>
    </div>
  );
}
