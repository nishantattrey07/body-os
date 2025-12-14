/**
 * Date utility functions for consistent date handling
 */

/**
 * Get start of day (00:00:00)
 */
export function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Get end of day (23:59:59)
 */
export function endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

/**
 * Get date N days ago
 */
export function daysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return startOfDay(date);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
    return startOfDay(date1).getTime() === startOfDay(date2).getTime();
}
