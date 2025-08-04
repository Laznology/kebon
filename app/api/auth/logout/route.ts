import { signOut } from "next-auth/react";

export function POST(){
    signOut({ redirect: false });
    return new Response(null, { status: 200 });
}