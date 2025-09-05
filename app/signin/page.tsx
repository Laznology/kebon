"use client"

import { Button } from "@/components/ui/button"
import {getSession, signIn} from 'next-auth/react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import React, {useState} from "react";

export default function SignIn() {
    const router = useRouter()
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (!email || !password) {
                toast.error("Please fill in all fields")
                setLoading(false)
                return null
            }

            const result = await signIn('credentials', {
                email,
                password,
                redirect: false
            })

            if (result?.error) {
                toast.error("Incorrect email or password")
                setLoading(false)
                return null
            }

            if (result?.ok){
                toast.success("Successfully logged in")
                const session = await getSession()
                if (session) {
                    router.push("/")
                    router.refresh()
                }
            }
        } catch  {
            toast.error("Sign is failed")
            setLoading(false)
        }
    }

    return (
        <div className={"flex items-center justify-center min-h-screen"}>
            <Card className={"w-full max-w-md"}>
                <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignIn} className={"space-y-4"}>
                        <div className={"space-y-2"}>
                            <Label htmlFor={"email"}>Email</Label>
                            <Input
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading} />
                        </div>
                        <div className={"space-y-2"}>
                            <Label htmlFor={"password"}>Password</Label>
                            <Input
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                type="password"
                            />
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        className={`w-full ${loading ? "animate-pulse" : ""}`}
                        disabled={loading}
                        onClick={handleSignIn}>
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}