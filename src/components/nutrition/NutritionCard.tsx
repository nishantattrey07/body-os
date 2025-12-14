"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface NutritionCardProps {
  name: string;
  amount: string; // e.g., "25g Pro"
  Icon: LucideIcon;
  color?: string;
  onClick: () => void;
}

export function NutritionCard({ name, amount, Icon, color = "text-foreground", onClick }: NutritionCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center rounded-3xl bg-white p-6 shadow-sm border border-zinc-50 transition-shadow hover:shadow-md aspect-square"
    >
      <div className={`mb-3 rounded-full bg-zinc-50 p-4 ${color}`}>
        <Icon size={32} />
      </div>
      <span className="text-xl font-bold uppercase tracking-wide font-heading text-foreground">{name}</span>
      <span className="text-sm font-medium text-zinc-400 font-body">{amount}</span>
    </motion.button>
  );
}
