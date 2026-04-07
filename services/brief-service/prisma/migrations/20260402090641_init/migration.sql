-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('WEB', 'MOBILE', 'DESKTOP', 'UI_UX', 'BRANDING', 'OTHER');

-- CreateEnum
CREATE TYPE "BriefStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REFUSED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "Brief" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "projectType" "ProjectType" NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT[],
    "budgetRange" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "BriefStatus" NOT NULL DEFAULT 'PENDING',
    "statusReason" TEXT,
    "statusUpdatedById" TEXT,
    "statusUpdatedAt" TIMESTAMP(3),
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brief_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Brief_clientId_idx" ON "Brief"("clientId");

-- CreateIndex
CREATE INDEX "Brief_assignedToId_idx" ON "Brief"("assignedToId");

-- CreateIndex
CREATE INDEX "Brief_status_idx" ON "Brief"("status");
