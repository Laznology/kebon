-- AlterTable
ALTER TABLE "public"."AppSettings" ADD COLUMN     "appLogo" TEXT NOT NULL DEFAULT '/Kebon Webp.webp',
ADD COLUMN     "appName" TEXT NOT NULL DEFAULT 'Kebon',
ADD COLUMN     "siteIcon" TEXT NOT NULL DEFAULT '/Kebon.ico';
