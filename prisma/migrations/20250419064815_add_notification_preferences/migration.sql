-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notificationPreferences" JSONB DEFAULT '{"email": true, "push": true, "inApp": true}';
