"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ActionCardProps {
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  color: string; // Tailwind text color class, e.g. "text-orange-500"
  bgColor?: string; // Optional background tint
  onClick: () => void;
  className?: string;
  variant?: "square" | "wide";
}

export function ActionCard({
  label,
  sublabel,
  icon: Icon,
  color,
  bgColor = "bg-white",
  onClick,
  className,
  variant = "square"
}: ActionCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 text-left shadow-sm transition-all hover:shadow-md border border-zinc-100",
        bgColor,
        className
      )}
    >
      <div className="flex flex-col h-full justify-between">
        <div className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
          "bg-zinc-50" 
        )}>
          <Icon className={cn("h-6 w-6", color)} strokeWidth={2.5} />
        </div>
        
        <div>
          <h3 className="font-heading text-2xl font-bold uppercase tracking-wide text-zinc-900 leading-none">
            {label}
          </h3>
          {sublabel && (
            <p className="font-sans text-xs font-medium text-zinc-400 mt-1 tracking-wide uppercase">
              {sublabel}
            </p>
          )}
        </div>
      </div>

      {/* Decorative gradient corner */}
      <div className={cn(
        "absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl opacity-20",
        color.replace("text-", "bg-")
      )} />
      
      {/* Decorative Arrow for wide cards */}
      {variant === "wide" && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
           {/* Maybe add chevron later if needed */}
        </div>
      )}
    </motion.button>
  );
}
