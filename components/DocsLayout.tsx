'use client'

import { useState } from "react";
import NavigationMenu from "@/components/NavigationMenu";
import React from "react";

type DocsLayoutProps = {
    children: React.ReactNode,
    toc: React.ReactNode,
}

export default function DocsLayout({ children, toc }: DocsLayoutProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <div className={"container mx-auto space-y-6"}>
            <nav className={"w-full flex justify-between relative"}>
                <span className={"font-semibold text-2xl"}>Kebon.</span>
                <button onClick={() => setIsOpen(!isOpen)}
                    className={"block md:hidden border rounded p-2 bg-blue-300 text-white shadow"}
                >
                    {isOpen ? "Close" : "Open"}
                </button>
            </nav>

            <div className={`absolute bg-black/20 border rounded h-auto mx-1 w-full px-1 transition-all ease-in-out duration-100 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} `}>
                <div>
                    Menu 1
                </div>
                <div>
                    menu 2
                </div>
            </div>

            <div className={"flex flex-col md:flex-row gap-2"}>
                <aside className={"hidden md:block border-r h-full w-full max-w-64"}>
                    <NavigationMenu />
                </aside>
                <main className={"gorw-1 w-full"}>
                    {children}
                </main>
                <aside className={"px-4 hidden md:block h-full border-l w-full max-w-64"}>
                    <span>Table of Contents</span>
                    {toc}
                </aside>
            </div>
        </div>
    )
}