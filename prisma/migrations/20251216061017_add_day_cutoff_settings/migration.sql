-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "dayCutoffHour" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "dayCutoffMinute" INTEGER NOT NULL DEFAULT 30;
