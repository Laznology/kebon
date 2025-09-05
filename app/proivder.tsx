"use client"
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export default function Provider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute={"class"} defaultTheme={"system"}>
            <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
    );
}