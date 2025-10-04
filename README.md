# Kebon

Blogging web app with a Notion-style editor. Basically you write in blocks instead of one big text area, so you can drag things around, split into sections, drop in quotes, lists, or code blocks just by typing /. The whole thing feels closer to building with Lego than filling a form.

## Features

- Block-based editor with drag and drop
- Search through pages and content
- User authentication with email/password or GitHub OAuth
- Role-based access control (admin and member roles)
- Admin-only settings management
- Trusted email restrictions for GitHub OAuth
- Responsive design for mobile and desktop
- Page publishing and draft management

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Framework**: Mantine UI, Tailwind CSS, Shadcn UI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Rich Text Editor**: TipTap **Notion-Like Editor**
- **Search**: Fuse.js

## Prerequisites

- Node.js LTS Version
- PNPM
- A PostgreSQL database

## Environment Variables

1. Duplicate`.env.example` and rename it to`.env`:
   ```bash
   cp .env.example .env
   ```
2. Update`DATABASE_URL` to point at your PostgreSQL instance.
3. Generate a new`NEXTAUTH_SECRET` if you do not already have one:
   ```bash
   openssl rand -base64 32
   ```

## Getting Started Locally

```bash
pnpm install
pnpm prisma migrate deploy   # applies committed migrations
pnpm db:seed                 # ensures the Home (index) page exist
pnpm dev             
```

The seed script respects the following optional variables:

- `SEED_ADMIN_EMAIL` (default`admin@gmail.com`)
- `SEED_ADMIN_NAME` (default`Admin`)
- `SEED_ADMIN_PASSWORD` (default`!admin@webapp`)

The seeded password is hashed with `bcryptjs`. Update these values in production environments.

## Working with Prisma

- **Create a new migration (development only)**

  ```bash
  pnpm prisma migrate dev --name <migration-name>
  ```

  This follows the official guidance in the Prisma docs: [https://www.prisma.io/docs/orm/prisma-migrate/working-with-prisma-migrate/development-and-production](https://www.prisma.io/docs/orm/prisma-migrate/working-with-prisma-migrate/development-and-production).
- **Apply migrations in production**

  ```bash
  pnpm prisma migrate deploy
  ```

  Run this during your deployment pipeline so the schema stays in sync. See the deployment checklist at [https://www.prisma.io/docs/orm/prisma-migrate/migrate-deploy](https://www.prisma.io/docs/orm/prisma-migrate/migrate-deploy).
- **Re-run the seed script**

  ```bash
  pnpm db:seed
  ```

  This is idempotent—it will ensure the admin user and the `index` page exist.

## Deployment Notes

The repository includes a `netlify.toml`, but the project works on any platform that supports Next.js.

## Project Structure

- `app/` – Next.js App Router pages, layouts, and API routes.
- `components/` – Shared UI elements, including the document editor.
- `lib/` – Server utilities (Prisma client, TOC generation, etc.).
- `prisma/` – Prisma schema, migrations, and seed script.

## Useful References

- Next.js App Router documentation:[https://nextjs.org/docs/app](https://nextjs.org/docs/app)
- Mantine UI components:[https://mantine.dev/](https://mantine.dev/)
- TipTap editor guide:[https://tiptap.dev/](https://tiptap.dev/)
- Prisma ORM documentation:[https://www.prisma.io/docs/](https://www.prisma.io/docs/)

Feel free to open issues or discussions if you run into bugs or want to contribute improvements.
