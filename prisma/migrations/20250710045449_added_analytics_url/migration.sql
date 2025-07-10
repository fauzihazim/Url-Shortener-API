/*
  Warnings:

  - Made the column `analyticsUrl` on table `url` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Url_analyticsUrl_key` ON `url`;

-- AlterTable
ALTER TABLE `url` MODIFY `analyticsUrl` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `AnalyticsUrl` (
    `id` INTEGER NOT NULL,
    `totalClick` INTEGER NOT NULL DEFAULT 0,
    `lastClicked` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AnalyticsUrl` ADD CONSTRAINT `AnalyticsUrl_id_fkey` FOREIGN KEY (`id`) REFERENCES `Url`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
