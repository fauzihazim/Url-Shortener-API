/*
  Warnings:

  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `user` table. All the data in the column will be lost.
  - Added the required column `user_type` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `password`,
    DROP COLUMN `verifiedAt`,
    ADD COLUMN `user_type` ENUM('TRADITIONAL', 'OAUTH') NOT NULL;

-- CreateTable
CREATE TABLE `TraditionalUser` (
    `idUser` INTEGER NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `verifiedAt` TIMESTAMP(6) NULL,

    PRIMARY KEY (`idUser`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OauthUser` (
    `idUser` INTEGER NOT NULL,
    `isVerified` BOOLEAN NOT NULL,

    PRIMARY KEY (`idUser`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TraditionalUser` ADD CONSTRAINT `TraditionalUser_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OauthUser` ADD CONSTRAINT `OauthUser_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
