/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `PageVersion` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Page_deletedAt_authorId_title_idx";

-- DropIndex
DROP INDEX "public"."PageVersion_pageId_deletedAt_idx";

-- DropIndex
DROP INDEX "public"."User_deletedAt_idx";

-- AlterTable
ALTER TABLE "public"."Page" DROP COLUMN "deletedAt",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."PageVersion" DROP COLUMN "deletedAt",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "deletedAt",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Page_isDeleted_authorId_title_idx" ON "public"."Page"("isDeleted", "authorId", "title");

-- CreateIndex
CREATE INDEX "PageVersion_pageId_isDeleted_idx" ON "public"."PageVersion"("pageId", "isDeleted");

-- CreateIndex
CREATE INDEX "User_isDeleted_idx" ON "public"."User"("isDeleted");
