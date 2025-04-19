/*
  Warnings:

  - The `status` column on the `surveys` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "surveys" DROP COLUMN "status",
ADD COLUMN     "status" "SurveyStatus" NOT NULL DEFAULT 'DRAFT';
