'use client'
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, TextInput, Group, Divider } from "@mantine/core";

export default function LoginPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    const handleLogin = async () => {
        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });
            if (res?.error) {
                setError(res.error);
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        }
    };

    const handleGithubLogin = async () => {
        try {
            await signIn("github");
        } catch (err) {
            setError("An unexpected error occurred.");
        }
    };

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ maxWidth: 400, margin: "auto", padding: "20px" }}>
            {session ? (
                <>
                    <p>Welcome, {session.user?.email}</p>
                    <Button onClick={() => signOut()}>Sign out</Button>
                </>
            ) : (
                <>
                    <h2>Login</h2>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        required
                    />
                    <TextInput
                        label="Password"
                        placeholder="Enter your password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)}
                        required
                    />
                    <Group justify="flex-end" mt="md">
                        <Button onClick={handleLogin}>Sign in</Button>
                    </Group>
                    <Divider my="sm" label="Or" labelPosition="center" />
                    <Button onClick={handleGithubLogin} variant="outline" fullWidth>
                        Sign in with GitHub
                    </Button>
                </>
            )}
        </div>
    );
}