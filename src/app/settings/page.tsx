"use client";

import { getUserSettings, updateUserSettings } from "@/app/actions/settings";
import { SettingsSkeleton } from "@/components/settings/SettingsSkeleton";
import { BigButton } from "@/components/ui/BigButton";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Droplets, Flame, LogOut, LucideIcon, Utensils } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getUserSettings();
      setTargets(settings);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserSettings(targets);
      toast.success("Settings updated successfully!");
      router.back();
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
    <div className="min-h-screen bg-background pb-12">
      {/* Header with Glass Effect */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10 mb-8">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 rounded-full bg-white hover:bg-zinc-100 shadow-sm transition-all active:scale-95 group"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-600 group-hover:text-primary transition-colors" />
          </button>
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-foreground font-heading">
            System Settings
          </h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Nutritional Targets */}
          <section>
             <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-400 mb-4 px-2">
              Nutritional Targets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <TargetCard
                label="Protein"
                unit="g"
                value={targets.proteinTarget}
                onChange={(v) => setTargets({ ...targets, proteinTarget: v })}
                icon={Utensils}
                colorClass="text-green-600"
                bgClass="bg-green-50/50 hover:bg-green-50"
                ringClass="focus-within:ring-green-500/20"
              />
              <TargetCard
                label="Daily Calories"
                unit="kcal"
                value={targets.caloriesTarget}
                onChange={(v) => setTargets({ ...targets, caloriesTarget: v })}
                icon={Flame}
                colorClass="text-red-600"
                bgClass="bg-red-50/50 hover:bg-red-50"
                ringClass="focus-within:ring-red-500/20"
                step={50}
              />
              <TargetCard
                label="Carbohydrates"
                unit="g"
                value={targets.carbsTarget}
                onChange={(v) => setTargets({ ...targets, carbsTarget: v })}
                icon={Utensils}
                colorClass="text-blue-600"
                bgClass="bg-blue-50/50 hover:bg-blue-50"
                ringClass="focus-within:ring-blue-500/20"
              />
              <TargetCard
                label="Fats"
                unit="g"
                value={targets.fatsTarget}
                onChange={(v) => setTargets({ ...targets, fatsTarget: v })}
                icon={Utensils}
                colorClass="text-amber-600"
                bgClass="bg-amber-50/50 hover:bg-amber-50"
                ringClass="focus-within:ring-amber-500/20"
              />
               <TargetCard
                label="Water Intake"
                unit="ml"
                value={targets.waterTarget}
                onChange={(v) => setTargets({ ...targets, waterTarget: v })}
                icon={Droplets}
                colorClass="text-cyan-600"
                bgClass="bg-cyan-50/50 hover:bg-cyan-50"
                ringClass="focus-within:ring-cyan-500/20"
                step={250}
                className="md:col-span-2"
              />
            </div>
          </section>

          {/* Section: System Configuration */}
           <section>
             <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-400 mb-4 px-2">
              System Configuration
            </h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
               <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                 <div>
                    <h3 className="text-2xl font-bold font-heading uppercase text-zinc-800">
                      Day Reset Time
                    </h3>
                    <p className="text-zinc-500 text-sm max-w-sm mt-1">
                      Determine when your daily tracking resets. Late-night logs before this time count towards the previous day.
                    </p>
                 </div>
                 <div className="flex items-center gap-2 bg-zinc-50 rounded-2xl p-2 border border-zinc-100">
                    <TimeInput 
                      value={targets.dayCutoffHour}
                      max={23}
                      onChange={(v) => setTargets({ ...targets, dayCutoffHour: v })}
                    />
                    <span className="text-2xl font-bold text-zinc-300 px-1">:</span>
                    <TimeInput 
                      value={targets.dayCutoffMinute}
                      max={59}
                      onChange={(v) => setTargets({ ...targets, dayCutoffMinute: v })}
                    />
                 </div>
               </div>
               <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-xl inline-flex">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">Recommended: 05:30 (Circadian Alignment)</span>
               </div>
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 sticky top-32">
             <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-400 mb-6">
              Actions
            </h2>
            
            <BigButton 
              onClick={handleSave} 
              disabled={saving} 
              className="w-full mb-4 text-2xl py-6"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Saving...
                </span>
              ) : "Save Changes"}
            </BigButton>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full py-4 px-6 rounded-2xl bg-zinc-50 text-zinc-600 font-bold text-lg uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:shadow-inner transition-all group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Sign Out
            </button>
            
            <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
              <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">
                Body OS v1.2.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TargetCard({
  label,
  unit,
  value,
  onChange,
  icon: Icon,
  colorClass,
  bgClass,
  ringClass,
  step = 10,
  className,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  ringClass: string;
  step?: number;
  className?: string;
}) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className={`relative group rounded-3xl p-5 border border-transparent transition-all duration-300 ${bgClass} ${className}`}
    >
      <div className={`absolute top-5 right-5 p-2 rounded-xl bg-white/60 backdrop-blur-sm ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">
        {label}
      </label>
      
      <div className={`flex items-baseline gap-1 relative z-10 p-2 -ml-2 rounded-xl transition-all ring-2 ring-transparent ${ringClass}`}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full text-5xl font-bold font-heading text-foreground bg-transparent border-none outline-none p-0 m-0 leading-none"
          min="0"
          step={step}
        />
        <span className="text-lg font-bold text-zinc-400 font-heading tracking-wide mb-1">{unit}</span>
      </div>
    </motion.div>
  );
}

function TimeInput({ value, max, onChange }: { value: number, max: number, onChange: (val: number) => void }) {
  return (
    <div className="relative group">
      <input
        type="number"
        value={value.toString().padStart(2, '0')}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          if (!isNaN(val) && val >= 0 && val <= max) {
            onChange(val);
          }
        }}
        onBlur={(e) => {
             // Ensure double digits on blur for aesthetics
             const val = parseInt(e.target.value) || 0;
             e.target.value = val.toString().padStart(2, '0');
        }}
        className="w-20 text-center text-4xl font-bold font-heading text-zinc-700 bg-white rounded-xl py-3 border-2 border-transparent hover:border-zinc-200 focus:border-primary focus:text-primary outline-none transition-all"
        min="0"
        max={max}
      />
      <div className="absolute inset-0 rounded-xl shadow-inner pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

