/*
  Warnings:

  - You are about to drop the `WorkoutLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,userId]` on the table `InventoryItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "BlockerStatus" AS ENUM ('ACTIVE', 'RECOVERING', 'RESOLVED', 'CHRONIC');

-- DropForeignKey
ALTER TABLE "WorkoutLog" DROP CONSTRAINT "WorkoutLog_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutLog" DROP CONSTRAINT "WorkoutLog_userId_fkey";

-- DropIndex
DROP INDEX "InventoryItem_name_key";

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "equipment" TEXT;

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "costPerUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "WorkoutLog";

-- CreateTable
CREATE TABLE "MuscleGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "majorRegion" TEXT NOT NULL,

    CONSTRAINT "MuscleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseMuscle" (
    "id" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "exerciseId" TEXT NOT NULL,
    "muscleGroupId" TEXT NOT NULL,

    CONSTRAINT "ExerciseMuscle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "weekOfYear" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeOfDay" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "preWorkoutEnergy" INTEGER,
    "sleepLastNight" DOUBLE PRECISION,
    "sleepQuality" INTEGER,
    "stressLevel" INTEGER,
    "soreness" INTEGER,
    "fastedWorkout" BOOLEAN NOT NULL DEFAULT false,
    "caffeineIntake" INTEGER,
    "postWorkoutEnergy" INTEGER,
    "pumpRating" INTEGER,
    "focusRating" INTEGER,
    "overallRating" INTEGER,
    "environment" TEXT,
    "trainingPhase" TEXT,
    "programName" TEXT,
    "mesocycleWeek" INTEGER,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "routineId" TEXT,
    "warmupLogId" TEXT,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionExercise" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "skipReason" TEXT,
    "swappedFromId" TEXT,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,

    CONSTRAINT "SessionExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetLog" (
    "id" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "targetReps" INTEGER NOT NULL,
    "actualReps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weightUnit" TEXT NOT NULL DEFAULT 'kg',
    "rpe" INTEGER,
    "painLevel" INTEGER,
    "painLocation" TEXT,
    "restTaken" INTEGER,
    "tempo" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isWarmupSet" BOOLEAN NOT NULL DEFAULT false,
    "isDropSet" BOOLEAN NOT NULL DEFAULT false,
    "isFailure" BOOLEAN NOT NULL DEFAULT false,
    "formNotes" TEXT,
    "sessionExerciseId" TEXT NOT NULL,
    "aggravatedBlockerId" TEXT,

    CONSTRAINT "SetLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicalBlocker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "status" "BlockerStatus" NOT NULL DEFAULT 'ACTIVE',
    "severity" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PhysicalBlocker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockerEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" INTEGER NOT NULL,
    "notes" TEXT,
    "blockerId" TEXT NOT NULL,

    CONSTRAINT "BlockerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MuscleGroup_name_key" ON "MuscleGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseMuscle_exerciseId_muscleGroupId_key" ON "ExerciseMuscle"("exerciseId", "muscleGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSession_warmupLogId_key" ON "WorkoutSession"("warmupLogId");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_date_idx" ON "WorkoutSession"("userId", "date");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_year_month_idx" ON "WorkoutSession"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "WorkoutSession_status_idx" ON "WorkoutSession"("status");

-- CreateIndex
CREATE INDEX "WorkoutSession_dayOfWeek_idx" ON "WorkoutSession"("dayOfWeek");

-- CreateIndex
CREATE INDEX "SessionExercise_sessionId_idx" ON "SessionExercise"("sessionId");

-- CreateIndex
CREATE INDEX "SetLog_sessionExerciseId_idx" ON "SetLog"("sessionExerciseId");

-- CreateIndex
CREATE INDEX "SetLog_completedAt_idx" ON "SetLog"("completedAt");

-- CreateIndex
CREATE INDEX "PhysicalBlocker_userId_status_idx" ON "PhysicalBlocker"("userId", "status");

-- CreateIndex
CREATE INDEX "BlockerEntry_blockerId_date_idx" ON "BlockerEntry"("blockerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_name_userId_key" ON "InventoryItem"("name", "userId");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseMuscle" ADD CONSTRAINT "ExerciseMuscle_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseMuscle" ADD CONSTRAINT "ExerciseMuscle_muscleGroupId_fkey" FOREIGN KEY ("muscleGroupId") REFERENCES "MuscleGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "WorkoutRoutine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_warmupLogId_fkey" FOREIGN KEY ("warmupLogId") REFERENCES "WarmupLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExercise" ADD CONSTRAINT "SessionExercise_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExercise" ADD CONSTRAINT "SessionExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetLog" ADD CONSTRAINT "SetLog_sessionExerciseId_fkey" FOREIGN KEY ("sessionExerciseId") REFERENCES "SessionExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetLog" ADD CONSTRAINT "SetLog_aggravatedBlockerId_fkey" FOREIGN KEY ("aggravatedBlockerId") REFERENCES "PhysicalBlocker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalBlocker" ADD CONSTRAINT "PhysicalBlocker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockerEntry" ADD CONSTRAINT "BlockerEntry_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "PhysicalBlocker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
