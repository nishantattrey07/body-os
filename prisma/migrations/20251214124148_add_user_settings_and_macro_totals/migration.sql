/*
  Warnings:

  - You are about to drop the column `fatTotal` on the `DailyLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DailyLog" DROP COLUMN "fatTotal",
ADD COLUMN     "fatsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proteinTarget" DOUBLE PRECISION NOT NULL DEFAULT 140,
    "carbsTarget" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "fatsTarget" DOUBLE PRECISION NOT NULL DEFAULT 60,
    "caloriesTarget" DOUBLE PRECISION NOT NULL DEFAULT 2000,
    "waterTarget" DOUBLE PRECISION NOT NULL DEFAULT 4000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
