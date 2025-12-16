"use client";

import { useDailyStore } from "@/store/dailyStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
    setTimeout(() => setTapped(false), 800);
  };

  return (
    <motion.button
      onClick={handleTap}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-3xl p-6  
        flex flex-col items-center justify-center gap-3 
        transition-all duration-300
        ${disabled 
            ? 'bg-zinc-50 opacity-50 cursor-not-allowed border-dashed border-2 border-zinc-200' 
            : 'bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] active:scale-[0.98] cursor-pointer border border-zinc-100 shadow-sm'
        } 
      `}
      whileTap={!disabled ? { scale: 0.96 } : {}}
    >
      {/* Emoji Icon */}
      <div className="text-5xl filter drop-shadow-md transition-transform duration-300 group-hover:scale-110" role="img">{icon}</div>
      
      {/* Name */}
      <div className="flex flex-col items-center gap-1 z-10">
        <span className="font-bold text-base text-zinc-900 text-center leading-tight font-heading tracking-wide uppercase">
          {name}
        </span>
        <span className="text-xs text-zinc-400 font-medium font-body bg-zinc-50 px-2 py-1 rounded-full border border-zinc-100">
          {protein}g PRO
        </span>
      </div>

      {/* Tap Feedback - A cleaner subtle ripple effect instead of full block */}
      {tapped && (
        <motion.div
            layoutId="ripple"
            className="absolute inset-0 bg-blue-500/5 z-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        />
      )}

      {/* Disabled Overlay */}
      {disabled && (
        <div className="absolute top-3 right-3">
          <div className="bg-zinc-200 text-zinc-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
            Off
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
  const { 
    items, 
    loading: itemsLoading, 
    loadItems 
  } = useInventoryStore();
  
  const { 
    proteinTotal,
    proteinTarget,
    loadTodayLog, 
    logNutritionItem 
  } = useDailyStore();

  useEffect(() => {
    loadItems();
    loadTodayLog();
  }, []);

  const handleTap = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    try {
      // Optimistic update via store
      await logNutritionItem(item);
      
      // Notify parent (legacy support)
      onLog?.(item.proteinPerUnit);
      
      // SUCCESS: No toast, just visual feedback from the card/banner
    } catch (error) {
      toast.error("Connection Failed", {
        description: "Could not log food. Please try again.",
      });
    }
  };



  if (itemsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-zinc-300 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Total Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
        
        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-xs opacity-80 uppercase tracking-widest font-semibold font-body mb-1">Today's Protein</p>
            <div className="flex items-baseline gap-1">
                <p className="text-6xl font-bold font-heading tracking-tight leading-none">
                    {Math.round(proteinTotal)}
                    <span className="text-3xl opacity-60 ml-1 font-body font-medium">g</span>
                </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80 mb-1 uppercase tracking-wider font-medium">Target</p>
            <p className="text-3xl font-bold font-heading tracking-wide">{Math.round(proteinTarget)}g</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6 bg-black/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
          <motion.div 
            className="bg-white h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((proteinTotal / proteinTarget) * 100, 100)}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
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
        <p className="text-center text-zinc-400 py-12 bg-zinc-50 rounded-3xl border border-zinc-100 border-dashed">
          No food items available. <br/>
          <span className="text-sm">Please add items to inventory.</span>
        </p>
      )}
    </div>
  );
}
