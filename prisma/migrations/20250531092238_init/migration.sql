-- CreateTable
CREATE TABLE `url` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `longUrl` TEXT NOT NULL,
    `shortCode` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `url_shortCode_key`(`shortCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
