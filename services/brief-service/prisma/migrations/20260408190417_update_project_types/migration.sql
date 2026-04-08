/*
  Warnings:

  - The values [WEB,MOBILE,DESKTOP,UI_UX] on the enum `ProjectType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectType_new" AS ENUM ('SITE_WEB', 'SEO', 'GOOGLE_ADS', 'SOCIAL_MEDIA', 'PHOTO_VIDEO', 'EMAIL_MARKETING', 'COMMUNITY_MANAGER', 'BRANDING', 'OTHER');
ALTER TABLE "Brief" ALTER COLUMN "projectType" TYPE "ProjectType_new" USING ("projectType"::text::"ProjectType_new");
ALTER TYPE "ProjectType" RENAME TO "ProjectType_old";
ALTER TYPE "ProjectType_new" RENAME TO "ProjectType";
DROP TYPE "public"."ProjectType_old";
COMMIT;
