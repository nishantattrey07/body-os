import { getInventoryItems } from '@/app/actions/nutrition';
import { create } from 'zustand';

export interface InventoryItem {
    id: string;
    name: string;
    icon: string;
    proteinPerUnit: number;
    carbsPerUnit: number;
    fatPerUnit: number;
    caloriesPerUnit: number;
    isActive: boolean;
}

interface InventoryStore {
    items: InventoryItem[];
    loading: boolean;
    initialized: boolean;

    // Actions
    loadItems: (forceRefresh?: boolean) => Promise<void>;
    invalidate: () => void;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
    items: [],
    loading: false,
    initialized: false,

    loadItems: async (forceRefresh = false) => {
        const { initialized, loading } = get();

        // Skip if already loading or initialized (unless force refresh)
        if (loading) return;
        if (initialized && !forceRefresh) return;

        set({ loading: true });

        try {
            const items = await getInventoryItems();
            set({
                items,
                loading: false,
                initialized: true
            });
        } catch (error) {
            console.error('Failed to load inventory:', error);
            set({ loading: false, initialized: true });
        }
    },

    // Call this to force a refresh on next load (e.g., after mutations)
    invalidate: () => set({ initialized: false }),
}));

