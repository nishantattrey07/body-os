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
    completeWarmupItem, getTodayWarmupProgress, getWarmupChecklist, getWorkoutRoutines, isWarmupComplete, toggleWarmupItem
} from './workout';

// Exercises
export { createExercise, deleteExercise, getExerciseCategories, getExercises, updateExercise } from './exercises';

// Routines
export {
    addExerciseToRoutine,
    batchUpdateRoutineExercises,
    createRoutine,
    deleteRoutine,
    getRoutineById,
    getRoutines,
    removeExerciseFromRoutine,
    reorderRoutineExercises,
    updateRoutine,
    updateRoutineExercise
} from './routines';

// Progress
export {
    getDeadHangHistory, getLatestPhotosByType, getProgressPhotos, logDeadHang, uploadProgressPhoto
} from './progress';

// Settings
export { getUserSettings, updateUserSettings } from './settings';
