import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.page.deleteMany();
  await prisma.user.deleteMany();

  console.log("Data lama berhasil dihapus.");

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: "hashed_password",
    },
  });
  const user1 = await prisma.user.create({
    data: {
      email: "user1@example.com",
      name: "User One",
      password: "hashed_password",
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: "user2@example.com",
      name: "User Two",
      password: "hashed_password",
    },
  });

  console.log("Users berhasil di-seed.");

  await prisma.page.create({
    data: {
      title: "Home",
      slug: "index",
      image: null,
      published: true,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Welcome to Kebon Docs" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This is the home page of your documentation.",
              },
            ],
          },
        ],
      },
      excerpt: "This is the home page of your documentation.",
      tags: ["home", "welcome"],
      authorId: admin.id,
    },
  });

  await prisma.page.create({
    data: {
      title: "Getting Started",
      slug: "getting-started",
      image: null,
      published: true,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Getting Started" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Learn how to get started with this documentation system.",
              },
            ],
          },
        ],
      },
      excerpt: "Learn how to get started with this documentation system.",
      tags: ["guide", "tutorial"],
      authorId: admin.id,
    },
  });

  await prisma.page.create({
    data: {
      title: "Advanced Usage",
      slug: "advanced-usage",
      image: null,
      published: false,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Advanced Usage" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Advanced features and configuration options.",
              },
            ],
          },
        ],
      },
      excerpt: "Advanced features and configuration options.",
      tags: ["advanced", "configuration"],
      authorId: user1.id,
    },
  });

  console.log("Pages berhasil di-seed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
