-- CreateIndex
CREATE INDEX "Exercise_isSystem_name_idx" ON "Exercise"("isSystem", "name");

-- CreateIndex
CREATE INDEX "Exercise_category_idx" ON "Exercise"("category");

-- CreateIndex
CREATE INDEX "Exercise_userId_name_idx" ON "Exercise"("userId", "name");

-- CreateIndex
CREATE INDEX "WorkoutRoutine_isSystem_name_idx" ON "WorkoutRoutine"("isSystem", "name");

-- CreateIndex
CREATE INDEX "WorkoutRoutine_userId_name_idx" ON "WorkoutRoutine"("userId", "name");
