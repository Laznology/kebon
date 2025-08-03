import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed users
  const users = await prisma.user.createMany({
    data: [
      { email: 'admin@example.com', name: 'Admin User', password: 'hashed_password' },
      { email: 'user1@example.com', name: 'User One', password: 'hashed_password' },
      { email: 'user2@example.com', name: 'User Two', password: 'hashed_password' },
    ],
  });

  // Seed documents
  const documents = await prisma.document.createMany({
    data: [
      {
        title: 'Document 1',
        slug: 'document-1',
        published: true,
        content: {
          blocks: [
            { type: 'paragraph', data: { text: 'This is the content of Document 1.' } },
          ],
        },
        authorId: 'admin@example.com',
      },
      {
        title: 'Document 2',
        slug: 'document-2',
        published: false,
        content: {
          blocks: [
            { type: 'paragraph', data: { text: 'This is the content of Document 2.' } },
          ],
        },
        authorId: 'user1@example.com',
      },
      {
        title: 'Document 3',
        slug: 'document-3',
        published: true,
        content: {
          blocks: [
            { type: 'paragraph', data: { text: 'This is the content of Document 3.' } },
          ],
        },
        authorId: 'user2@example.com',
      },
    ],
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
