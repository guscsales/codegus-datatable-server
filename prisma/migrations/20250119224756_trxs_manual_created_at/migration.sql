/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "updatedAt",
ALTER COLUMN "createdAt" DROP DEFAULT;
