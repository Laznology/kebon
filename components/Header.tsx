"use client"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Monitor } from "lucide-react"

export default function Header() {
    const { theme, setTheme } = useTheme()
    const router = useRouter()

    return (
        <nav className="bg-background border-b">
            <div className="container mx-auto flex justify-between items-center py-2">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Image
                        width={32}
                        height={32}
                        src="/Kebon%20Webp.webp"
                        alt="Logo"
                        className="object-cover"
                    />
                    <span className="font-semibold">Kebon</span>
                </div>

                {/* Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Theme</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40" align="end">
                        <DropdownMenuLabel>Pilih Tema</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="mr-2 h-4 w-4" />
                            Terang
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="mr-2 h-4 w-4" />
                            Gelap
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            <Monitor className="mr-2 h-4 w-4" />
                            Ikuti Sistem
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    )
}
