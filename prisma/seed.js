import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Hapus data lama
  await prisma.page.deleteMany();
  await prisma.user.deleteMany();

  console.log('Data lama berhasil dihapus.');

  // Seed users
  const admin = await prisma.user.create({
    data: { email: 'admin@example.com', name: 'Admin User', password: 'hashed_password' },
  });
  const user1 = await prisma.user.create({
    data: { email: 'user1@example.com', name: 'User One', password: 'hashed_password' },
  });
  const user2 = await prisma.user.create({
    data: { email: 'user2@example.com', name: 'User Two', password: 'hashed_password' },
  });

  console.log('Users berhasil di-seed.');

  // Seed pages
  await prisma.page.create({
    data: {
      title: 'page 1',
      slug: 'page-1',
      image: null,
      published: true,
      content: {
        blocks: [
          { type: 'paragraph', data: { text: 'This is the content of page 1.' } },
        ],
      },
      authorId: admin.id,
    },
  });

  await prisma.page.create({
    data: {
      title: 'page 2',
      slug: 'page-2',
      image: null,
      published: false,
      content: {
        blocks: [
          { type: 'paragraph', data: { text: 'This is the content of page 2.' } },
        ],
      },
      authorId: user1.id,
    },
  });

  await prisma.page.create({
    data: {
      title: 'page 3',
      slug: 'page-3',
      image: null,
      published: true,
      content: {
        blocks: [
          { type: 'paragraph', data: { text: 'This is the content of page 3.' } },
        ],
      },
      authorId: user2.id,
    },
  });

  console.log('Pages berhasil di-seed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });