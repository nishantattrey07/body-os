"use client";

import { cn } from "@/lib/utils";
import { HTMLMotionProps, motion } from "framer-motion";
import { forwardRef } from "react";

interface BigButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "energy";
}

const BigButton = forwardRef<HTMLButtonElement, BigButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-primary-foreground shadow-primary/20",
      secondary: "bg-secondary text-secondary-foreground shadow-secondary/20",
      energy: "bg-energy text-energy-foreground shadow-energy/20",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "w-full rounded-2xl py-6 px-4 text-3xl font-bold uppercase tracking-wider shadow-xl transition-all font-heading",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
BigButton.displayName = "BigButton";

export { BigButton };
