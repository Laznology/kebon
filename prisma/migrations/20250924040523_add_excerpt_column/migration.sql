-- AlterTable
ALTER TABLE "public"."Page" ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "Page_published_isDeleted_idx" ON "public"."Page"("published", "isDeleted");

-- CreateIndex
CREATE INDEX "Page_slug_idx" ON "public"."Page"("slug");
