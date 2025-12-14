/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,userId]` on the table `Exercise` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,userId]` on the table `WorkoutRoutine` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "RoutineExercise" DROP CONSTRAINT "RoutineExercise_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "RoutineExercise" DROP CONSTRAINT "RoutineExercise_routineId_fkey";

-- DropIndex
DROP INDEX "Exercise_name_key";

-- DropIndex
DROP INDEX "WorkoutRoutine_name_key";

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "defaultReps" SET DEFAULT 10,
ALTER COLUMN "defaultSets" SET DEFAULT 3;

-- AlterTable
ALTER TABLE "RoutineExercise" ADD COLUMN     "reps" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "restSeconds" INTEGER NOT NULL DEFAULT 90,
ADD COLUMN     "sets" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkoutRoutine" ADD COLUMN     "isSystem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_userId_key" ON "Exercise"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutRoutine_name_userId_key" ON "WorkoutRoutine"("name", "userId");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutRoutine" ADD CONSTRAINT "WorkoutRoutine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineExercise" ADD CONSTRAINT "RoutineExercise_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "WorkoutRoutine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineExercise" ADD CONSTRAINT "RoutineExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
