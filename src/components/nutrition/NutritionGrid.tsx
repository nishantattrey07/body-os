"use client";

import { NutritionCard } from "@/components/nutrition/NutritionCard";
import { useInventoryStore } from "@/store/inventoryStore";
import { Beef, Disc, Droplets, Leaf, Loader2, Milk, Utensils, Wheat } from "lucide-react";
import { useEffect } from "react";

// Map string icon names from DB to Lucide components
const ICON_MAP: Record<string, any> = {
  Milk: Milk,
  Beef: Beef,
  Utensils: Utensils,
  Wheat: Wheat,
  Droplets: Droplets,
  Leaf: Leaf,
};

interface NutritionGridProps {
  onLog: (protein: number, calories: number) => void;
  disabled?: boolean;
}

export function NutritionGrid({ onLog, disabled }: NutritionGridProps) {
  const { items, loading, loadItems } = useInventoryStore();

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  if (loading) {
    return (
        <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-zinc-300" />
        </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 gap-4 w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {items.map((item) => {
        const IconComponent = ICON_MAP[item.icon] || Disc; // Fallback icon
        
        // Simple color mapping based on name/icon for now (can be moved to DB later)
        let color = "text-zinc-500";
        if (item.icon === "Milk") color = "text-blue-500";
        if (item.icon === "Beef") color = "text-red-600";
        if (item.icon === "Utensils") color = "text-yellow-500";
        if (item.icon === "Wheat") color = "text-amber-700";
        if (item.icon === "Droplets") color = "text-blue-400";
        if (item.icon === "Leaf") color = "text-green-500";

        return (
            <NutritionCard
            key={item.id}
            name={item.name}
            amount={`${item.proteinPerUnit}g Pro`}
            Icon={IconComponent}
            color={color}
            onClick={() => onLog(item.proteinPerUnit, item.caloriesPerUnit)}
            />
        );
      })}
    </div>
  );
}

