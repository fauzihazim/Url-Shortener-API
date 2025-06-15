-- CreateTable
CREATE TABLE `VerificationToken` (
    `id` INTEGER NOT NULL,
    `idUser` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `tokenExpire` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VerificationToken` ADD CONSTRAINT `VerificationToken_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `TraditionalUser`(`idUser`) ON DELETE RESTRICT ON UPDATE CASCADE;
