"use client";

import { getUserSettings, updateUserSettings } from "@/app/actions/settings";
import { SettingsSkeleton } from "@/components/settings/SettingsSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronLeft, Droplets, Flame, LogOut, LucideIcon, Utensils } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [targets, setTargets] = useState({
    proteinTarget: 140,
    carbsTarget: 200,
    fatsTarget: 60,
    caloriesTarget: 2000,
    waterTarget: 4000,
    dayCutoffHour: 5,
    dayCutoffMinute: 30,
  });
  // Track initial state for dirty checking
  const [initialTargets, setInitialTargets] = useState<typeof targets | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getUserSettings();
      setTargets(settings);
      setInitialTargets(settings);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const isDirty = JSON.stringify(targets) !== JSON.stringify(initialTargets);

  const handleSave = async () => {
    if (!isDirty) return;
    setSaving(true);
    try {
      await updateUserSettings(targets);
      toast.success("Settings updated successfully!");
      setInitialTargets(targets); // Update baseline
      router.refresh(); 
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-12 relative overflow-hidden">
       {/* Ambient Background */}
       <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-100/40 rounded-full blur-[100px]" />
          <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-green-100/30 rounded-full blur-[100px]" />
       </div>

      {/* Header with Glass Effect */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100 mb-8">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 rounded-full bg-white hover:bg-zinc-50 border border-zinc-100 shadow-sm transition-all active:scale-95 group"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-600 group-hover:text-zinc-900 transition-colors" />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold uppercase tracking-tighter text-zinc-900 font-heading leading-none">
              SYSTEM SETTINGS
            </h1>
            <AnimatePresence>
              {isDirty && (
                <motion.span
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-1"
                >
                  Unsaved Changes
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Section: Nutritional Targets */}
          <section>
             <div className="flex items-center gap-3 mb-6">
                <div className="h-px bg-zinc-200 flex-1" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Nutritional Configuration</h2>
                <div className="h-px bg-zinc-200 flex-1" />
             </div>
             
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <TargetCard
                label="Daily Protein"
                unit="g"
                value={targets.proteinTarget}
                onChange={(v) => setTargets({ ...targets, proteinTarget: v })}
                icon={Utensils}
                step={5}
                theme="green"
              />
              <TargetCard
                label="Daily Calories"
                unit="kcal"
                value={targets.caloriesTarget}
                onChange={(v) => setTargets({ ...targets, caloriesTarget: v })}
                icon={Flame}
                step={50}
                theme="red"
              />
              <TargetCard
                label="Daily Carbs"
                unit="g"
                value={targets.carbsTarget}
                onChange={(v) => setTargets({ ...targets, carbsTarget: v })}
                icon={Utensils}
                step={5}
                theme="blue"
              />
              <TargetCard
                label="Daily Fats"
                unit="g"
                value={targets.fatsTarget}
                onChange={(v) => setTargets({ ...targets, fatsTarget: v })}
                icon={Utensils}
                step={5}
                theme="amber"
              />
               <TargetCard
                label="Water Intake"
                unit="ml"
                value={targets.waterTarget}
                onChange={(v) => setTargets({ ...targets, waterTarget: v })}
                icon={Droplets}
                step={250}
                theme="cyan"
                className="md:col-span-2"
              />
            </div>
          </section>

          {/* Section: System Configuration */}
           <section>
             <div className="flex items-center gap-3 mb-6">
                <div className="h-px bg-zinc-200 flex-1" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">System Timing</h2>
                <div className="h-px bg-zinc-200 flex-1" />
             </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-zinc-200/50 border border-white/50 relative overflow-hidden group">
               {/* Decorative Gradient */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />

               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
                 <div className="max-w-md">
                    <h3 className="text-2xl font-bold font-heading uppercase text-zinc-900 mb-2">
                      Day Reset Protocol
                    </h3>
                    <p className="text-zinc-500 leading-relaxed">
                      This defines when your "day" officially ends. Logs before this time are attributed to the previous calendar day – perfect for night owls.
                    </p>
                    
                    <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-purple-600 bg-purple-50 px-3 py-2 rounded-lg w-fit">
                        <Check className="w-3 h-3" />
                        <span>Recommended: 05:30 AM</span>
                    </div>
                 </div>

                 {/* Digital Clock Widget */}
                 <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 bg-zinc-900 p-4 rounded-2xl shadow-lg border border-zinc-800">
                        <TimeInput 
                          value={targets.dayCutoffHour}
                          max={23}
                          onChange={(v) => setTargets({ ...targets, dayCutoffHour: v })}
                        />
                        <div className="flex flex-col gap-2 opacity-50">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-75" />
                        </div>
                        <TimeInput 
                          value={targets.dayCutoffMinute}
                          max={59}
                          onChange={(v) => setTargets({ ...targets, dayCutoffMinute: v })}
                        />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">24-Hour Format</span>
                 </div>
               </div>
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-zinc-100 sticky top-32">
             <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isDirty ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
              {isDirty ? 'Unsaved Changes' : 'Active Session'}
            </h2>
            
            <motion.button
              whileHover={{ scale: isDirty ? 1.02 : 1 }}
              whileTap={{ scale: isDirty ? 0.98 : 1 }}
              onClick={handleSave} 
              disabled={!isDirty || saving} 
              className={`w-full mb-3 py-4 rounded-xl font-bold uppercase tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 overflow-hidden relative
                ${(isDirty || saving)
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/20 hover:shadow-green-500/30 cursor-pointer" 
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"}
              `}
            >
              <div className="relative flex items-center justify-center w-full h-6">
                <AnimatePresence mode="popLayout">
                  {!saving ? (
                    <motion.div 
                      key="text"
                      className="flex items-center gap-[1px]"
                      exit={{ opacity: 0 }} // Container exit
                    >
                      {"SAVE CONFIGURATION".split("").map((char, i) => (
                         <motion.span
                            key={i}
                            initial={{ opacity: 1, x: 0 }}
                            exit={{ 
                                opacity: 0, 
                                x: 20, 
                                transition: { duration: 0.1, delay: i * 0.03 } 
                            }}
                            className="inline-block"
                         >
                            {char === " " ? "\u00A0" : char}
                         </motion.span>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ 
                          x: 0, 
                          opacity: 1,
                          transition: { delay: 0.4, type: "spring", stiffness: 200, damping: 20 }
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                       <Check className="w-8 h-8 stroke-[3]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
            


            <motion.button
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full py-4 px-6 rounded-xl bg-red-50 text-red-600 font-bold uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              System Logout
            </motion.button>
            
            <div className="mt-8 pt-6 border-t border-zinc-100/50 text-center">
              <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-[0.2em]">
                Body OS v1.2.0 • Build 240
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Subcomponents ---

const THEMES = {
   green: { bg: "bg-green-50", text: "text-green-600", ring: "focus-within:ring-green-500/20", iconBg: "bg-green-100" },
   red: { bg: "bg-red-50", text: "text-red-600", ring: "focus-within:ring-red-500/20", iconBg: "bg-red-100" },
   blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "focus-within:ring-blue-500/20", iconBg: "bg-blue-100" },
   amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "focus-within:ring-amber-500/20", iconBg: "bg-amber-100" },
   cyan: { bg: "bg-cyan-50", text: "text-cyan-600", ring: "focus-within:ring-cyan-500/20", iconBg: "bg-cyan-100" },
};

function TargetCard({
  label,
  unit,
  value,
  onChange,
  icon: Icon,
  theme = "green",
  step = 10,
  className,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  icon: LucideIcon;
  theme?: keyof typeof THEMES;
  step?: number;
  className?: string;
}) {
   const t = THEMES[theme];
   const [isEditing, setIsEditing] = useState(false);
   const [localValue, setLocalValue] = useState(value.toString());
   const inputRef = useRef<HTMLInputElement>(null);

   // Sync local value when prop changes
   useEffect(() => {
     setLocalValue(value.toString());
   }, [value]);

   // Focus input when editing starts
   useEffect(() => {
      if (isEditing && inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
      }
   }, [isEditing]);

   const handleBlur = () => {
    const num = parseFloat(localValue) || 0;
    onChange(num);
    setLocalValue(num.toString());
    setIsEditing(false);
   };

   const handleKeyDown = (e: React.KeyboardEvent) => {
       if (e.key === "Enter") {
           handleBlur();
       }
       if (e.key === "Escape") {
           setLocalValue(value.toString());
           setIsEditing(false);
       }
   };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={`group bg-white rounded-3xl p-6 shadow-sm hover:shadow-md border border-zinc-100 transition-all duration-300 relative overflow-hidden ${className} ${isEditing ? 'ring-2 ring-primary/20 bg-zinc-50/50' : ''}`}
    >
       {/* Field Label & Icon */}
       <div className="flex items-start justify-between mb-4 relative z-10 pointer-events-none">
          <div className="flex items-center gap-2">
             <div className={`p-2 rounded-xl ${t.bg} ${t.text}`}>
                <Icon className="w-4 h-4" />
             </div>
             <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
               {label}
             </label>
          </div>
       </div>

       {/* Value Control */}
       <div className="flex items-center justify-between relative z-10">
          <div 
             className="flex items-baseline gap-1 w-full cursor-text hover:opacity-80 transition-opacity"
             onClick={(e) => {
                 e.stopPropagation();
                 if (!isEditing) setIsEditing(true);
             }}
          >
             {isEditing ? (
                 <input
                    ref={inputRef}
                    type="text"
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`w-full text-4xl font-bold font-heading ${t.text} tracking-tight bg-transparent border-none outline-none p-0 m-0`}
                 />
             ) : (
                 <span className={`text-4xl font-bold font-heading ${t.text} tracking-tight`}>
                    {value}
                 </span>
             )}
             <span className="text-sm font-bold text-zinc-300 lowercase shrink-0">{unit}</span>
          </div>


       </div>
    </motion.div>
  );
}

function TimeInput({ value, max, onChange }: { value: number, max: number, onChange: (val: number) => void }) {
  const [localValue, setLocalValue] = useState(value.toString().padStart(2, '0'));

  useEffect(() => {
    setLocalValue(value.toString().padStart(2, '0'));
  }, [value]);

  const handleBlur = () => {
     let val = parseInt(localValue);
     if (isNaN(val) || val < 0) val = 0;
     if (val > max) val = max;
     onChange(val);
     setLocalValue(val.toString().padStart(2, '0'));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp") onChange(value >= max ? 0 : value + 1);
      if (e.key === "ArrowDown") onChange(value <= 0 ? max : value - 1);
  };

  return (
    <div className="relative group w-20">
       {/* Hidden Arrows for hover */}
       <div className="absolute -top-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ChevronLeft className="w-3 h-3 text-white/20 rotate-90" />
       </div>

      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full text-center text-4xl font-bold font-heading text-white bg-transparent border-none outline-none p-0 selection:bg-white/20"
      />
      
       <div className="absolute -bottom-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ChevronLeft className="w-3 h-3 text-white/20 -rotate-90" />
       </div>
    </div>
  )
}

