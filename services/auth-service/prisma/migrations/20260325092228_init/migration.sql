/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `VerifyToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstName` to the `VerifyToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `VerifyToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `VerifyToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerifyToken" ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "VerifyToken_email_key" ON "VerifyToken"("email");
