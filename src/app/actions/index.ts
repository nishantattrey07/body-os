/**
 * Body OS - Centralized Action Exports
 * Import all server actions from a single file
 */

// Nutrition Actions
export {
    getInventoryItems, getNutritionTotals, getTodayNutritionLogs, logNutrition, toggleInventoryItem
} from './nutrition';

// Water Actions
export {
    getTodayWaterLogs,
    getWaterTotal, logWater
} from './water';

// Workout Actions
export {
    completeWarmupItem, getTodayWarmupProgress, getTodayWorkoutLogs, getWarmupChecklist, getWorkoutHistory, getWorkoutRoutines, isWarmupComplete,
    logExercise
} from './workout';

// Daily Log Actions
export {
    createDailyLog, getDailyLogs, getTodayLog,
    markBloated,
    submitDailyReview
} from './daily-log';

// Progress Actions
export {
    getDeadHangHistory, getLatestPhotosByType, getProgressPhotos, logDeadHang, uploadProgressPhoto
} from './progress';

