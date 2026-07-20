/*
  Warnings:

  - You are about to drop the `pages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `site_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "pages";

-- DropTable
DROP TABLE "site_settings";

-- CreateIndex
CREATE INDEX "sections_version_id_sort_order_idx" ON "sections"("version_id", "sort_order");

-- CreateIndex
CREATE INDEX "sections_parent_id_idx" ON "sections"("parent_id");

-- CreateIndex
CREATE INDEX "versions_standard_id_status_idx" ON "versions"("standard_id", "status");

-- CreateIndex
CREATE INDEX "versions_standard_id_is_latest_idx" ON "versions"("standard_id", "is_latest");
