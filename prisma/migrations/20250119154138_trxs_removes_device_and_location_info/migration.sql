/*
  Warnings:

  - You are about to drop the column `deviceInfo` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "deviceInfo",
DROP COLUMN "location";
