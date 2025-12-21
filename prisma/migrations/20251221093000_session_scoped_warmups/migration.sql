-- Migration: Session-Scoped Warmups
-- This migration modifies WarmupLog to be session-scoped instead of date-scoped
-- and adds warmupCompleted field to WorkoutSession

-- Drop the old unique constraint on WarmupLog
ALTER TABLE "WarmupLog" DROP CONSTRAINT IF EXISTS "WarmupLog_userId_warmupChecklistId_date_key";

-- Add workoutSessionId column to WarmupLog
ALTER TABLE "WarmupLog" ADD COLUMN IF NOT EXISTS "workoutSessionId" TEXT;

-- Add foreign key constraint for workoutSessionId
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'WarmupLog_workoutSessionId_fkey'
  ) THEN
    ALTER TABLE "WarmupLog" ADD CONSTRAINT "WarmupLog_workoutSessionId_fkey" 
    FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Add new unique constraint for session-scoped warmups
ALTER TABLE "WarmupLog" ADD CONSTRAINT "WarmupLog_userId_warmupChecklistId_workoutSessionId_key" 
UNIQUE ("userId", "warmupChecklistId", "workoutSessionId");

-- Add index on workoutSessionId
CREATE INDEX IF NOT EXISTS "WarmupLog_workoutSessionId_idx" ON "WarmupLog"("workoutSessionId");

-- Add warmupCompleted field to WorkoutSession
ALTER TABLE "WorkoutSession" ADD COLUMN IF NOT EXISTS "warmupCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Remove old warmupLogId column from WorkoutSession if it exists (migrating from 1:1 to 1:many)
ALTER TABLE "WorkoutSession" DROP CONSTRAINT IF EXISTS "WorkoutSession_warmupLogId_fkey";
ALTER TABLE "WorkoutSession" DROP COLUMN IF EXISTS "warmupLogId";
