/**
 * Body OS - Centralized exports for all server actions
 */

// Daily Log
export { createDailyLog, getDailyLogs, getTodayLog, markBloated, submitDailyReview } from './daily-log';

// Nutrition
export {
    getInventoryItems, getNutritionTotals, getTodayNutritionLogs, logNutrition,
    toggleInventoryItem
} from './nutrition';

// Water
export { getTodayWaterLogs, getWaterTotal, logWater } from './water';

// Workout
export {
    completeWarmupItem, getTodayWarmupProgress, getTodayWorkoutLogs, getWarmupChecklist, getWorkoutHistory, getWorkoutRoutines, isWarmupComplete,
    logExercise, toggleWarmupItem
} from './workout';

// Progress
export {
    getDeadHangHistory, getLatestPhotosByType, getProgressPhotos, logDeadHang, uploadProgressPhoto
} from './progress';

// Settings
export { getUserSettings, updateUserSettings } from './settings';
