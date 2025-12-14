-- AlterTable
ALTER TABLE "DailyLog" ADD COLUMN     "caloriesTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "carbsTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "fatTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "mood" TEXT,
ADD COLUMN     "sleepQuality" INTEGER;

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "carbsPerUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "fatPerUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxDailyQty" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "NutritionLog" ADD COLUMN     "mealType" TEXT;

-- CreateTable
CREATE TABLE "WarmupChecklist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "WarmupChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WarmupLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "warmupChecklistId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WarmupLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WaterLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutRoutine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "WorkoutRoutine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineExercise" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "routineId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,

    CONSTRAINT "RoutineExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressPhoto" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imagePath" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProgressPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeadHangLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seconds" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DeadHangLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyReview" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tookSoya" BOOLEAN,
    "elbowStatus" TEXT,
    "notes" TEXT,
    "dailyLogId" TEXT NOT NULL,

    CONSTRAINT "DailyReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WarmupChecklist_name_key" ON "WarmupChecklist"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WarmupLog_userId_warmupChecklistId_date_key" ON "WarmupLog"("userId", "warmupChecklistId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutRoutine_name_key" ON "WorkoutRoutine"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DailyReview_dailyLogId_key" ON "DailyReview"("dailyLogId");

-- AddForeignKey
ALTER TABLE "WarmupLog" ADD CONSTRAINT "WarmupLog_warmupChecklistId_fkey" FOREIGN KEY ("warmupChecklistId") REFERENCES "WarmupChecklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarmupLog" ADD CONSTRAINT "WarmupLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterLog" ADD CONSTRAINT "WaterLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineExercise" ADD CONSTRAINT "RoutineExercise_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "WorkoutRoutine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineExercise" ADD CONSTRAINT "RoutineExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressPhoto" ADD CONSTRAINT "ProgressPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeadHangLog" ADD CONSTRAINT "DeadHangLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyReview" ADD CONSTRAINT "DailyReview_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
