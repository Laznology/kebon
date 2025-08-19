"use client"

import { Button } from "@/components/ui/button";
import { signIn } from 'next-auth/react';

export default function SignIn() {
    return <Button onClick={() => signIn('github', { callbackUrl: '/'})}>Sign in with GitHub</Button>
}