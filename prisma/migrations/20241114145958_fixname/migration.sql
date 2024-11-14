/*
  Warnings:

  - You are about to drop the column `lastLogin` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "lastLogin",
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
