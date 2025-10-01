import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import Github from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
    error: "/auth/error", 
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "github") {
        return true;
      }

      try {
        const settings = await prisma.appSettings.findFirst();
        const allowedEmails = settings?.allowedEmails?.trim();
        
        if (!allowedEmails) {
          return false;
        }

        const userEmail = user?.email?.toLowerCase();
        if (!userEmail) {
          return false;
        }

        const allowedList = allowedEmails
          .toLowerCase()
          .split(",")
          .map(email => email.trim())
          .filter(email => email.length > 0);

        return allowedList.includes(userEmail);
      } catch {
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        });
        token.role = dbUser?.role || "MEMBER";
      }

      return token;
    },
    async session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as "ADMIN" | "MEMBER";
        }
        return session;
    },
  },
};

export async function auth() {
  return await getServerSession(authOptions as NextAuthOptions);
}

export default authOptions;
