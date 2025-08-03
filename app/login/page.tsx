'use client'
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    
    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard")
        }
    }, [status, router])
    if (status === "loading") {
        return <div>Loading...</div>
    }

    return (
        <div>
            {session ? (
                <>
                    <p>Welcome, {session.user?.email}</p>
                    <button onClick={() => signOut()}>Sign out</button>
                </>
            ) : (
                <>
                    <p>Please sign in</p>
                    <button onClick={() => signIn()}>Sign in</button>
                </>
            )}
        </div>
    );
}