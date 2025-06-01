/*
  Warnings:

  - A unique constraint covering the columns `[shortUrl]` on the table `Url` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `url` MODIFY `shortUrl` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Url_shortUrl_key` ON `Url`(`shortUrl`);
