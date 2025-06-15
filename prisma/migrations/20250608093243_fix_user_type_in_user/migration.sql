/*
  Warnings:

  - You are about to drop the column `user_type` on the `user` table. All the data in the column will be lost.
  - Added the required column `userType` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `user_type`,
    ADD COLUMN `userType` ENUM('TRADITIONAL', 'OAUTH') NOT NULL;
