import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Hapus data lama
  await prisma.document.deleteMany(); // Hapus semua dokumen
  await prisma.user.deleteMany(); // Hapus semua user

  console.log('Data lama berhasil dihapus.');

  // Seed users
  const users = await prisma.user.createMany({
    data: [
      { email: 'admin@example.com', name: 'Admin User', password: 'hashed_password' },
      { email: 'user1@example.com', name: 'User One', password: 'hashed_password' },
      { email: 'user2@example.com', name: 'User Two', password: 'hashed_password' },
    ],
  });

  // Ambil user IDs berdasarkan email
  const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  const user1 = await prisma.user.findUnique({ where: { email: 'user1@example.com' } });
  const user2 = await prisma.user.findUnique({ where: { email: 'user2@example.com' } });

  if (!admin || !user1 || !user2) {
    throw new Error('Gagal menemukan user untuk seeding dokumen.');
  }

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
        authorId: admin.id, // Gunakan ID admin
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
        authorId: user1.id, // Gunakan ID user1
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
        authorId: user2.id, // Gunakan ID user2
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
