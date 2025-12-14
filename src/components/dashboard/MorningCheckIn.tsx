"use client";

import { BigButton } from "@/components/ui/BigButton";
import { motion } from "framer-motion";
import { useState } from "react";

interface MorningCheckInProps {
  onComplete: (data: { weight: number; sleep: number }) => void;
}

export function MorningCheckIn({ onComplete }: MorningCheckInProps) {
  const [weight, setWeight] = useState<string>("");
  const [sleep, setSleep] = useState<string>("");

  const handleSubmit = () => {
    if (weight && sleep) {
      onComplete({
        weight: parseFloat(weight),
        sleep: parseFloat(sleep),
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex w-full max-w-sm flex-col items-center gap-8 bg-white p-8 rounded-[3rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold uppercase tracking-tighter font-heading text-primary">
          Morning Check-In
        </h2>
        <p className="text-zinc-300 font-medium text-sm tracking-wide">Initialize Body OS for the day</p>
      </div>

      <div className="w-full space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-300 font-heading pl-4">
            Current Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="83.5"
            className="w-full rounded-3xl border-0 bg-background p-6 text-center text-4xl font-bold text-foreground placeholder-zinc-100 focus:ring-2 focus:ring-primary font-heading shadow-inner outline-none"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-300 font-heading pl-4">
            Sleep Duration (hrs)
          </label>
          <input
            type="number"
            step="0.1"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            placeholder="7.5"
            className="w-full rounded-3xl border-0 bg-background p-6 text-center text-4xl font-bold text-foreground placeholder-zinc-100 focus:ring-2 focus:ring-primary font-heading shadow-inner outline-none"
          />
        </div>
      </div>

      <BigButton 
        onClick={handleSubmit} 
        disabled={!weight || !sleep}
        className="mt-4 shadow-[0_10px_30px_-10px_rgba(239,20,0,0.4)]"
      >
        Initialize System
      </BigButton>
    </motion.div>
  );
}
