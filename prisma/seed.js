import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.pageVersion.deleteMany();
  await prisma.page.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: "hashed_password",
    },
  });


  await prisma.page.create({
    data: {
      title: "Get Started",
      slug: "index",
      image: null,
      published: true,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Get Started" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Welcome! This is your starting point for building documentation with Kebon.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "How to Begin" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Edit this page or create new pages to organize your documentation. Use the TipTap editor for easy content management.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Next Steps" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Start by adding your project details, guides, or FAQs to help users get up and running.",
              },
            ],
          },
        ],
      },
      excerpt: "Get started with Kebon documentation.",
      tags: ["get-started", "home", "welcome"],
      authorId: admin.id,
    },
  });

  console.log("Index page berhasil dibuat.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
