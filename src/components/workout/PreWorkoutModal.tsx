"use client";

import { BigButton } from "@/components/ui/BigButton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Activity, Brain, Coffee, Utensils, X, Zap } from "lucide-react";
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

  const getRatingColor = (type: 'energy' | 'stress' | 'soreness', value: number) => {
    if (type === 'energy') {
      // Energy: Low (1) is bad/tired (Red/Gray), High (5) is good (Green/Energy)
      const colors = {
        1: "bg-red-400 text-white",
        2: "bg-orange-400 text-white",
        3: "bg-yellow-400 text-black",
        4: "bg-lime-400 text-black",
        5: "bg-[#89fe00] text-black", // Brand Energy
      };
      return colors[value as keyof typeof colors];
    } 
    
    // Stress & Soreness: Low (1) is good (Green), High (5) is bad (Red)
    const colors = {
      1: "bg-emerald-400 text-white",
      2: "bg-teal-400 text-white",
      3: "bg-yellow-400 text-black",
      4: "bg-orange-500 text-white",
      5: "bg-red-600 text-white", 
    };
    return colors[value as keyof typeof colors];
  };

  const getHeaderColor = (type: 'energy' | 'stress' | 'soreness', value: number) => {
     // Returns text color for the header value (5/5 etc)
     const bgClass = getRatingColor(type, value);
     if (bgClass.includes('text-black')) return 'text-zinc-800';
     
     // Extract the color name relative to bg (e.g. bg-red-500 -> text-red-600)
     if (bgClass.includes('red')) return 'text-red-600';
     if (bgClass.includes('orange')) return 'text-orange-600';
     if (bgClass.includes('emerald')) return 'text-emerald-600';
     if (bgClass.includes('teal')) return 'text-teal-600';
     if (bgClass.includes('lime') || bgClass.includes('#89fe00')) return 'text-lime-600';
     return 'text-zinc-600';
  }

  const RatingScale = ({ 
    value, 
    onChange, 
    icon: Icon, 
    label,
    type,
    id
  }: { 
    value: number; 
    onChange: (v: number) => void; 
    icon: any; 
    label: string;
    type: 'energy' | 'stress' | 'soreness';
    id: string;
  }) => {
    const activeColorClass = getRatingColor(type, value);
    const headerColorClass = getHeaderColor(type, value);

    return (
      <div className="space-y-4 p-5 rounded-3xl bg-zinc-50/50 border border-zinc-100/80">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl transition-colors duration-300", activeColorClass.split(' ')[0], "bg-opacity-10")}>
              <Icon size={20} className={headerColorClass} />
            </div>
            <span className="text-lg font-extrabold uppercase tracking-wide text-zinc-700">{label}</span>
          </div>
          <span className={cn("text-xl font-black transition-colors duration-300", headerColorClass)}>
            {value}/5
          </span>
        </div>
        
        <div className="relative flex w-full bg-white p-1.5 rounded-2xl h-14 shadow-sm border border-zinc-100">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={cn(
                "flex-1 relative z-10 font-bold text-lg transition-colors duration-300 flex items-center justify-center",
                value === n 
                  ? (activeColorClass.includes('text-black') ? "text-black" : "text-white") 
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {n}
              {value === n && (
                <motion.div
                  layoutId={`indicator-${id}`}
                  className={cn("absolute inset-0 rounded-xl shadow-md z-[-1]", activeColorClass.split(' ')[0])}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Close Button - Floated */}
        <div className="absolute top-4 right-4 z-20">
             <button 
                onClick={onCancel}
                className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 transition-colors"
                >
                <X size={20} />
            </button>
        </div>

        {/* Header */}
        <div className="pt-8 pb-2 px-8 text-center bg-gradient-to-b from-white to-white/95">
          <h2 className="text-5xl font-bold uppercase tracking-tighter font-heading text-primary leading-none">
            Check In
          </h2>
          <p className="text-zinc-400 font-medium text-sm tracking-wide mt-1 uppercase">
            {routineName}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
          {/* Metrics */}
          <div className="space-y-6">
            <RatingScale
              id="energy"
              type="energy"
              value={energy}
              onChange={setEnergy}
              icon={Zap}
              label="Energy"
            />

            <RatingScale
              id="stress"
              type="stress"
              value={stress}
              onChange={setStress}
              icon={Brain}
              label="Stress"
            />

            <RatingScale
              id="soreness"
              type="soreness"
              value={soreness}
              onChange={setSoreness}
              icon={Activity}
              label="Soreness"
            />
          </div>

          {/* Context Tiles */}
          <div className="grid grid-cols-2 gap-4">
            {/* Fasted Toggle */}
            <button
              onClick={() => setFasted(!fasted)}
              className={cn(
                "relative group overflow-hidden rounded-3xl p-5 border transition-all duration-300 h-32 flex flex-col justify-between text-left",
                fasted 
                  ? "border-amber-400 bg-amber-50/80" 
                  : "border-zinc-100/80 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-200"
              )}
            >
               <div className="flex justify-between w-full">
                 <div className={cn(
                    "p-2 rounded-xl transition-colors",
                    fasted ? "bg-amber-100 text-amber-600" : "bg-white text-zinc-400 border border-zinc-100"
                    )}>
                    <Utensils size={20} />
                 </div>
                 <div className={cn(
                    "w-5 h-5 rounded-full border-2 transition-colors",
                     fasted ? "border-amber-500 bg-amber-500" : "border-zinc-300"
                )} />
               </div>
               
               <div>
                  <p className={cn(
                    "font-extrabold uppercase tracking-wide text-lg",
                    fasted ? "text-amber-700" : "text-zinc-500"
                  )}>
                    Fasted
                  </p>
                  <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">
                    {fasted ? "Yes, empty stomach" : "No, verify intake"}
                  </p>
               </div>
            </button>

            {/* Caffeine Input */}
            <div className="relative rounded-3xl p-5 border border-zinc-100/80 bg-zinc-50/50 h-32 flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between w-full">
                    <div className="p-2 rounded-xl bg-white text-zinc-500 border border-zinc-100">
                        <Coffee size={20} />
                    </div>
                 </div>

                 <div className="flex items-end justify-between">
                     <div>
                        <p className="font-extrabold uppercase tracking-wide text-lg text-zinc-500">
                            Caffeine
                        </p>
                        <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">Milligrams</p>
                     </div>
                     
                     <div className="absolute top-5 right-5">
                        <input
                            type="number"
                            min="0"
                            max="999"
                            value={caffeine || ""}
                            onChange={(e) => setCaffeine(parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-20 bg-transparent text-right font-black text-4xl text-zinc-800 placeholder-zinc-200 focus:outline-none z-10 p-0"
                        />
                     </div>
                 </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-2 bg-white rounded-b-[2.5rem]">
          <BigButton 
            onClick={handleSubmit} 
            className="w-full text-2xl py-6 shadow-xl shadow-red-500/20"
          >
            Start Workout
          </BigButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
