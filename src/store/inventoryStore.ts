import { getInventoryItems } from '@/app/actions';
import { create } from 'zustand';

interface InventoryItem {
    id: string;
    name: string;
    icon: string;
    proteinPerUnit: number;
    caloriesPerUnit: number;
}

interface InventoryStore {
    items: InventoryItem[];
    loading: boolean;
    initialized: boolean;

    // Actions
    loadItems: () => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
    items: [],
    loading: false,
    initialized: false,

    loadItems: async () => {
        const { initialized } = get();

        // Only fetch once per session
        if (initialized) return;

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
}));
