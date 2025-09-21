import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import Github from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    Github({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValidPassword) {
          return null;
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    // @ts-expect-error: NextAuth mengharapkan return type Promise<boolean | string>
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        const allowedEmails = process.env.ALLOWED_EMAILS?.split(",");
        /**
         * Memeriksa apakah email pengguna ada di dalam daftar email yang diizinkan.
         * @returns {boolean} Mengembalikan `true` jika email valid, atau `false` jika tidak.
         * So it Works 👍🏻
         */
        return !!(user.email && allowedEmails?.includes(user.email));
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const id = token?.id || token.sub;
        if (id) {
          session.user.id = id as string;
        }
      }
      return session;
    },
  },
};

export async function auth() {
  return await getServerSession(authOptions as NextAuthOptions);
}

export default authOptions;
