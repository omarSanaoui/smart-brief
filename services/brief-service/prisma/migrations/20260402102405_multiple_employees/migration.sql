/*
  Warnings:

  - You are about to drop the column `assignedToId` on the `Brief` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Brief_assignedToId_idx";

-- AlterTable
ALTER TABLE "Brief" DROP COLUMN "assignedToId",
ADD COLUMN     "assignedToIds" TEXT[];
