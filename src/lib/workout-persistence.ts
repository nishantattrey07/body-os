/**
 * Workout Persistence Layer
 * 
 * Provides crash-proof localStorage backup for workout data.
 * Data is saved locally BEFORE server sync, ensuring zero data loss
 * even if the phone dies, app crashes, or WiFi drops mid-set.
 * 
 * Usage:
 * 1. Call persistPendingSet() immediately when user logs a set
 * 2. Call markSetSynced() after server confirms save
 * 3. On app load, call getUnsyncedSets() to retry failed syncs
 * 4. Call clearWorkoutData() only after session is fully completed
 */

const STORAGE_KEY = 'body-os-pending-sets';
const SESSION_KEY = 'body-os-active-session';

export interface PendingSet {
    id: string; // UUID for tracking
    sessionExerciseId: string;
    setNumber: number;
    targetReps?: number;
    actualReps?: number;
    targetDuration?: number;
    actualSeconds?: number;
    weight?: number;
    painLevel?: number;
    painLocation?: string;
    restTaken?: number;
    aggravatedBlockerId?: string;
    timestamp: number;
    synced: boolean;
}

export interface ActiveSessionData {
    sessionId: string;
    routineId: string;
    routineName: string;
    startedAt: number;
    currentExerciseIndex: number;
    setsLoggedCount: number;
}

// Generate a unique ID for each set
function generateSetId(): string {
    return `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save a set to localStorage immediately (before server sync)
 */
export function persistPendingSet(setData: Omit<PendingSet, 'id' | 'synced' | 'timestamp'>): string {
    const pendingSet: PendingSet = {
        ...setData,
        id: generateSetId(),
        timestamp: Date.now(),
        synced: false,
    };

    const existing = getPendingSets();
    existing.push(pendingSet);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
        console.error('[WorkoutPersistence] Failed to save pending set:', e);
    }

    return pendingSet.id;
}

/**
 * Mark a set as synced (server confirmed save)
 */
export function markSetSynced(setId: string): void {
    const sets = getPendingSets();
    const index = sets.findIndex(s => s.id === setId);

    if (index !== -1) {
        sets[index].synced = true;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
        } catch (e) {
            console.error('[WorkoutPersistence] Failed to mark set synced:', e);
        }
    }
}

/**
 * Get all pending sets (for display or retry)
 */
export function getPendingSets(): PendingSet[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('[WorkoutPersistence] Failed to read pending sets:', e);
        return [];
    }
}

/**
 * Get only unsynced sets (for retry on app load)
 */
export function getUnsyncedSets(): PendingSet[] {
    return getPendingSets().filter(s => !s.synced);
}

/**
 * Clear all pending sets (call after workout complete + verified)
 */
export function clearPendingSets(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('[WorkoutPersistence] Failed to clear pending sets:', e);
    }
}

/**
 * Save active session data for resume on crash
 */
export function persistActiveSession(data: ActiveSessionData): void {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('[WorkoutPersistence] Failed to save active session:', e);
    }
}

/**
 * Get active session data (for resume after crash)
 */
export function getPersistedSession(): ActiveSessionData | null {
    try {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('[WorkoutPersistence] Failed to read active session:', e);
        return null;
    }
}

/**
 * Clear active session (after completion/abandon)
 */
export function clearPersistedSession(): void {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (e) {
        console.error('[WorkoutPersistence] Failed to clear active session:', e);
    }
}

/**
 * Clear all workout data (full reset)
 */
export function clearAllWorkoutData(): void {
    clearPendingSets();
    clearPersistedSession();
}

/**
 * Check if there's pending workout data to recover
 */
export function hasRecoverableData(): boolean {
    const session = getPersistedSession();
    const unsyncedSets = getUnsyncedSets();
    return session !== null || unsyncedSets.length > 0;
}
