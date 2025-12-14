"use client";

import { motion } from "framer-motion";
import { Activity, Battery, Brain, Coffee, Utensils } from "lucide-react";
import { useState } from "react";

interface PreWorkoutModalProps {
  routineName: string;
  onStart: (data: PreWorkoutData) => void;
  onCancel: () => void;
}

export interface PreWorkoutData {
  preWorkoutEnergy: number;
  stressLevel: number;
  soreness: number;
  fastedWorkout: boolean;
  caffeineIntake?: number;
}

export function PreWorkoutModal({ routineName, onStart, onCancel }: PreWorkoutModalProps) {
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(2);
  const [soreness, setSoreness] = useState(2);
  const [fasted, setFasted] = useState(false);
  const [caffeine, setCaffeine] = useState(0);

  const handleSubmit = () => {
    onStart({
      preWorkoutEnergy: energy,
      stressLevel: stress,
      soreness,
      fastedWorkout: fasted,
      caffeineIntake: caffeine || undefined,
    });
  };

  const RatingScale = ({ 
    value, 
    onChange, 
    icon: Icon, 
    label,
    color = "blue"
  }: { 
    value: number; 
    onChange: (v: number) => void; 
    icon: any; 
    label: string;
    color?: string;
  }) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      orange: "bg-orange-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-zinc-500" />
          <span className="text-sm font-medium text-zinc-700">{label}</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`flex-1 h-10 rounded-xl font-bold text-sm transition-all ${
                value >= n 
                  ? `${colors[color]} text-white` 
                  : "bg-zinc-100 text-zinc-400"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-zinc-100 rounded-t-3xl">
          <h2 className="text-2xl font-bold text-foreground">How are you feeling?</h2>
          <p className="text-sm text-zinc-500 mt-1">Starting {routineName}</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Energy Level */}
          <RatingScale
            value={energy}
            onChange={setEnergy}
            icon={Battery}
            label="Current Energy"
            color="green"
          />

          {/* Stress Level */}
          <RatingScale
            value={stress}
            onChange={setStress}
            icon={Brain}
            label="Stress Level"
            color="orange"
          />

          {/* Soreness (DOMS) */}
          <RatingScale
            value={soreness}
            onChange={setSoreness}
            icon={Activity}
            label="Soreness (DOMS)"
            color="red"
          />

          {/* Toggles Row */}
          <div className="flex gap-4">
            {/* Fasted */}
            <button
              onClick={() => setFasted(!fasted)}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
                fasted 
                  ? "border-amber-500 bg-amber-50" 
                  : "border-zinc-200 bg-white"
              }`}
            >
              <Utensils size={20} className={fasted ? "text-amber-600" : "text-zinc-400"} />
              <p className={`text-sm font-medium mt-1 ${fasted ? "text-amber-700" : "text-zinc-500"}`}>
                Fasted
              </p>
            </button>

            {/* Caffeine */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Coffee size={16} className="text-zinc-500" />
                <span className="text-sm font-medium text-zinc-700">Caffeine (mg)</span>
              </div>
              <input
                type="number"
                min="0"
                max="500"
                step="25"
                value={caffeine}
                onChange={(e) => setCaffeine(parseInt(e.target.value) || 0)}
                className="w-full p-3 rounded-xl border border-zinc-200 text-center font-bold text-lg"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white p-6 border-t border-zinc-100 space-y-3 rounded-b-3xl">
          <button
            onClick={handleSubmit}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg uppercase tracking-wider shadow-lg"
          >
            Start Workout →
          </button>
          <button
            onClick={onCancel}
            className="w-full h-12 rounded-2xl text-zinc-500 font-medium"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
