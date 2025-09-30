-- AlterTable
ALTER TABLE "public"."AppSettings" ADD COLUMN     "allowedEmails" TEXT DEFAULT '',
ALTER COLUMN "appLogo" SET DEFAULT '/logo.webp',
ALTER COLUMN "siteIcon" SET DEFAULT '/favicon.ico';
