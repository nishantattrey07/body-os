"use client";

import { getInventoryItems, getTodayNutritionLogs, logNutrition } from "@/app/actions/nutrition";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface FoodCardProps {
  id: string;
  name: string;
  icon: string; // emoji
  protein: number;
  disabled: boolean;
  onTap: (id: string) => void;
}

function FoodCard({ name, icon, protein, disabled, onTap, id }: FoodCardProps) {
  const [tapped, setTapped] = useState(false);

  const handleTap = async () => {
    if (disabled) return;
    
    setTapped(true);
    await onTap(id);
    
    // Reset animation after delay
    setTimeout(() => setTapped(false), 1000);
  };

  return (
    <motion.button
      onClick={handleTap}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-3xl p-6  
        flex flex-col items-center justify-center gap-3 
        transition-all duration-200 
        ${disabled ? 'bg-zinc-100 opacity-40 cursor-not-allowed' : 'bg-white hover:shadow-lg active:scale-95 cursor-pointer'} 
        border ${disabled ? 'border-zinc-200' : 'border-zinc-100'}
      `}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {/* Emoji Icon */}
      <div className="text-5xl" role="img">{icon}</div>
      
      {/* Name */}
      <div className="flex flex-col items-center gap-1">
        <span className="font-bold text-base text-zinc-900 text-center leading-tight">
          {name}
        </span>
        <span className="text-sm text-zinc-500 font-medium">
          {protein}g Pro
        </span>
      </div>

      {/* Tap Feedback */}
      {tapped && (
        <motion.div
          className="absolute inset-0 bg-green-500/20 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <span className="text-green-600 font-bold text-xl">+{protein}g</span>
        </motion.div>
      )}

      {/* Disabled Overlay */}
      {disabled && (
        <div className="absolute top-2 right-2">
          <div className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">
            Disabled
          </div>
        </div>
      )}
    </motion.button>
  );
}

interface NutritionGridProps {
  onLog?: (protein: number) => void;
}

export function NutritionGrid({ onLog }: NutritionGridProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [inventoryItems, todayLogs] = await Promise.all([
        getInventoryItems(),
        getTodayNutritionLogs()
      ]);
      
      setItems(inventoryItems);
      
      // Calculate today's total
      const total = todayLogs.reduce((sum: number, log: any) => 
        sum + (log.inventoryItem.proteinPerUnit * log.qty), 0
      );
      setTodayTotal(total);
    } catch (error) {
      console.error("Failed to load nutrition data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTap = async (itemId: string) => {
    try {
      const log = await logNutrition(itemId, 1);
      
      // Update local total
      const newProtein = log.inventoryItem.proteinPerUnit;
      setTodayTotal(prev => prev + newProtein);
      
      // Reload items (in case bloat detection disabled something)
      const updatedItems = await getInventoryItems();
      setItems(updatedItems);
      
      // Notify parent
      onLog?.(newProtein);
    } catch (error) {
      console.error("Failed to log nutrition:", error);
      alert("Failed to log food. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-zinc-300 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Total Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80 uppercase tracking-wider font-medium">Today's Protein</p>
            <p className="text-4xl font-bold font-heading">{Math.round(todayTotal)}g</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Target</p>
            <p className="text-2xl font-bold">140g</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
          <motion.div 
            className="bg-white h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((todayTotal / 140) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <FoodCard
            key={item.id}
            id={item.id}
            name={item.name}
            icon={item.icon}
            protein={item.proteinPerUnit}
            disabled={!item.isActive}
            onTap={handleTap}
          />
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-center text-zinc-400 py-8">
          No food items available. Please add items to inventory.
        </p>
      )}
    </div>
  );
}
