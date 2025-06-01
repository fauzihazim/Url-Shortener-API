-- DropIndex
DROP INDEX `url_shortUrl_key` ON `url`;

-- AlterTable
ALTER TABLE `url` MODIFY `shortUrl` TEXT NOT NULL;
