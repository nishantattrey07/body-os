"use client";

import { motion } from "framer-motion";

interface FuelGaugeProps {
  current: number;
  target: number;
  label: string;
  unit: string;
}

export function FuelGauge({ current, target, label, unit }: FuelGaugeProps) {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  // Circumference of a circle with r=90 is 2*PI*90 ≈ 565.48
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex h-72 w-72 flex-col items-center justify-center">
      {/* Background Circle */}
      <svg className="absolute h-full w-full rotate-[-90deg]" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#e5e5e5"
          strokeWidth="12"
          className="opacity-50"
        />
        {/* Progress Circle */}
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--energy)"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>

      {/* Center Content */}
      <div className="z-10 flex flex-col items-center">
        <div className="flex items-baseline">
            <span className="text-8xl font-bold text-foreground font-heading">
            {current}
            </span>
            <span className="text-3xl text-zinc-500 font-heading ml-1">{unit}</span>
        </div>
        <span className="text-xl uppercase tracking-wider text-secondary font-heading mt-2">
          {label}
        </span>
      </div>
      
      {/* Decorative inner ring (aesthetic only) */}
      <div className="absolute inset-4 rounded-full border-2 border-zinc-100/50 pointer-events-none" />
    </div>
  );
}
