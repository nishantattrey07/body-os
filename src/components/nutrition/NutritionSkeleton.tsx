"use client";

import { motion } from "framer-motion";

/**
 * Skeleton loader for NutritionGrid component.
 * Matches the layout: summary banner + 2-column food grid.
 */
export function NutritionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Banner Skeleton */}
      <div className="bg-gradient-to-r from-blue-400/60 to-blue-500/50 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-3 w-24 bg-white/30 rounded-full" />
            <div className="h-12 w-28 bg-white/40 rounded-lg" />
          </div>
          <div className="text-right space-y-3">
            <div className="h-3 w-16 bg-white/30 rounded-full ml-auto" />
            <div className="h-8 w-20 bg-white/40 rounded-lg ml-auto" />
          </div>
        </div>
        {/* Progress bar skeleton */}
        <div className="mt-6 bg-black/10 rounded-full h-2">
          <div className="bg-white/50 h-full w-1/3 rounded-full" />
        </div>
      </div>

      {/* Food Grid Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center gap-3 border border-zinc-100"
          >
            {/* Emoji placeholder */}
            <div className="w-12 h-12 bg-zinc-100 rounded-full" />
            {/* Name */}
            <div className="h-4 w-16 bg-zinc-100 rounded-full" />
            {/* Protein badge */}
            <div className="h-5 w-14 bg-zinc-50 rounded-full" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
