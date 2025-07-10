/*
  Warnings:

  - A unique constraint covering the columns `[analyticsUrl]` on the table `Url` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `oauthuser` DROP FOREIGN KEY `oauthuser_ibfk_1`;

-- DropForeignKey
ALTER TABLE `traditionaluser` DROP FOREIGN KEY `traditionaluser_ibfk_1`;

-- DropForeignKey
ALTER TABLE `url` DROP FOREIGN KEY `url_ibfk_1`;

-- DropForeignKey
ALTER TABLE `verificationtoken` DROP FOREIGN KEY `verificationtoken_ibfk_1`;

-- DropIndex
DROP INDEX `idUser` ON `url`;

-- DropIndex
DROP INDEX `idUser` ON `verificationtoken`;

-- AlterTable
ALTER TABLE `url` ADD COLUMN `analyticsUrl` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Url_analyticsUrl_key` ON `Url`(`analyticsUrl`);

-- AddForeignKey
ALTER TABLE `Url` ADD CONSTRAINT `Url_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TraditionalUser` ADD CONSTRAINT `TraditionalUser_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OauthUser` ADD CONSTRAINT `OauthUser_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VerificationToken` ADD CONSTRAINT `VerificationToken_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `TraditionalUser`(`idUser`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `url` RENAME INDEX `shortUrl` TO `Url_shortUrl_key`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `email` TO `User_email_key`;
