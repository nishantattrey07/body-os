-- CreateIndex
CREATE INDEX "InventoryItem_isActive_idx" ON "InventoryItem"("isActive");

-- CreateIndex
CREATE INDEX "NutritionLog_userId_timestamp_idx" ON "NutritionLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "WaterLog_userId_timestamp_idx" ON "WaterLog"("userId", "timestamp");
