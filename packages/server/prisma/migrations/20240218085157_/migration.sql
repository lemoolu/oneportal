/*
  Warnings:

  - You are about to drop the column `phonen_umber` on the `User` table. All the data in the column will be lost.
  - Added the required column `phonenNumber` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "phonen_umber",
ADD COLUMN     "phonenNumber" TEXT NOT NULL;
