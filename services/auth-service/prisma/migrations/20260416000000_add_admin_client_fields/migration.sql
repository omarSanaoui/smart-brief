-- AlterTable
ALTER TABLE "User" ADD COLUMN "addedByAdminId" TEXT,
ADD COLUMN "isPlaceholderEmail" BOOLEAN NOT NULL DEFAULT false;
