import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import Github from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Github({
            clientId: process.env.GITHUB_ID || '',
            clientSecret: process.env.GITHUB_SECRET || '',
        }),
    ],
    pages: {
        signIn: '/signin',
    },
};
// Helper to get the current session from server components or server code
export async function auth() {
    return await getServerSession(authOptions as NextAuthOptions)
}

export default authOptions;

