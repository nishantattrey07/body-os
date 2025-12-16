import { getInventoryItems } from '@/app/actions/nutrition';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';

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

/**
 * Query hook for inventory items
 * 
 * Features:
 * - Cached for 1 minute (staleTime from global config)
 * - Auto-refetches on window focus
 * - Use queryClient.invalidateQueries to force refresh
 */
export function useInventory() {
    return useQuery({
        queryKey: queryKeys.inventory,
        queryFn: async () => {
            const items = await getInventoryItems();
            return items as InventoryItem[];
        },
    });
}
