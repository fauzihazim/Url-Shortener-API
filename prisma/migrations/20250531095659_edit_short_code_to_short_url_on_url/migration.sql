/*
  Warnings:

  - You are about to drop the column `shortCode` on the `url` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shortUrl]` on the table `url` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shortUrl` to the `url` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `url_shortCode_key` ON `url`;

-- AlterTable
ALTER TABLE `url` DROP COLUMN `shortCode`,
    ADD COLUMN `shortUrl` VARCHAR(10) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `url_shortUrl_key` ON `url`(`shortUrl`);
