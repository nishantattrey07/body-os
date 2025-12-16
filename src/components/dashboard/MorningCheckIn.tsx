"use client";

import { createDailyLog } from "@/app/actions/daily-log";
import { BigButton } from "@/components/ui/BigButton";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface MorningCheckInProps {
  onComplete: () => void;
  cutoffHour?: number;
  cutoffMinute?: number;
}

export function MorningCheckIn({ onComplete, cutoffHour = 5, cutoffMinute = 30 }: MorningCheckInProps) {
  const [weight, setWeight] = useState<string>("");
  const [sleep, setSleep] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (weight && sleep) {
      setSubmitting(true);
      try {
        await createDailyLog({
          weight: parseFloat(weight),
          sleepHours: parseFloat(sleep),
        }, cutoffHour, cutoffMinute);
        onComplete();
      } catch (error) {
        console.error("Failed to create daily log:", error);
        toast.error("Failed to save check-in. Please try again.");
      } finally {
        setSubmitting(false);
      }
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
        <p className="text-zinc-400 font-medium text-sm tracking-wide">
          Initialize Body OS for the day
        </p>
      </div>

      <div className="w-full space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-heading pl-4">
            Current Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="84.0"
            className="w-full rounded-3xl border-0 bg-background p-6 text-center text-4xl font-bold text-foreground placeholder-zinc-200 focus:ring-2 focus:ring-primary font-heading shadow-inner outline-none"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 font-heading pl-4">
            Sleep Duration (hrs)
          </label>
          <input
            type="number"
            step="0.5"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            placeholder="7.0"
            className="w-full rounded-3xl border-0 bg-background p-6 text-center text-4xl font-bold text-foreground placeholder-zinc-200 focus:ring-2 focus:ring-primary font-heading shadow-inner outline-none"
          />
        </div>
      </div>

      <BigButton 
        onClick={handleSubmit} 
        disabled={!weight || !sleep || submitting}
        className="mt-4 shadow-[0_10px_30px_-10px_rgba(239,68,68,0.4)]"
      >
        {submitting ? "Initializing..." : "Initialize System"}
      </BigButton>
    </motion.div>
  );
}
