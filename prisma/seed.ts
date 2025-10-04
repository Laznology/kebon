import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { JSONContent } from "@tiptap/core";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@gmail.com";
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";
  const rawPassword = process.env.SEED_ADMIN_PASSWORD ?? "!admin@webapp";
  const passwordHash = await bcrypt.hash(rawPassword, 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const updates: Prisma.UserUpdateInput = {};
    if (!existing.password) {
      updates.password = passwordHash;
    }
    if (!existing.name) {
      updates.name = name;
    }
    if (existing.isDeleted) {
      updates.isDeleted = false;
    }
    if (!existing.role || existing.role === "MEMBER") {
      updates.role = "ADMIN";
    }

    if (Object.keys(updates).length > 0) {
      return prisma.user.update({
        where: { id: existing.id },
        data: updates,
      });
    }

    return existing;
  }

  const existingName = await prisma.user.findUnique({ where: { name } });
  const finalName = existingName ? `${name}_${Date.now()}` : name;

  const user = await prisma.user.create({
    data: {
      email,
      name: finalName,
      password: passwordHash,
      role: "ADMIN",
    },
  });

  return user;
}

async function seedIndexPage(authorId: string) {
  const defaultTitle = "Home";
  const defaultExcerpt = "Start writing your documentation here.";
  const defaultContent: JSONContent = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: defaultTitle }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: defaultExcerpt,
          },
        ],
      },
    ],
  };

  const existing = await prisma.page.findUnique({ where: { slug: "index" } });

  if (existing) {
    await prisma.page.update({
      where: { id: existing.id },
      data: {
        isDeleted: false,
        published: true,
        title: existing.title || defaultTitle,
        excerpt: existing.excerpt ?? defaultExcerpt,
        content: (existing.content as JSONContent | null) ?? defaultContent,
        authorId: existing.authorId ?? authorId,
        tags: existing.tags?.length ? existing.tags : ["home"],
      },
    });
    return;
  }

  await prisma.page.create({
    data: {
      title: defaultTitle,
      slug: "index",
      image: null,
      published: true,
      content: defaultContent,
      excerpt: defaultExcerpt,
      tags: ["home"],
      authorId,
    },
  });
}

async function main() {
  const admin = await seedAdmin();
  await seedIndexPage(admin.id);
  await prisma.appSettings.upsert({
    where: {id: 1},
    update: {},
    create: {
      allowRegister: false,
      allowedEmails: "",
      appName: "Kebon",
      appLogo: "/logo.webp",
      siteIcon: "/favicon.ico"
    }
  })

  console.log("Seed completed: admin user ensured and index page ready.");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
