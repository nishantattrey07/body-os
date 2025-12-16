"use client";

import { getUserSettings, updateUserSettings } from "@/app/actions/settings";
import { BigButton } from "@/components/ui/BigButton";
import { ArrowLeft, LogOut } from "lucide-react";
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
      toast.success("Settings saved!");
      router.back();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
        >
          <ArrowLeft className="text-zinc-600" />
        </button>
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-foreground font-heading">
          Daily Targets
        </h1>
      </div>

      <div className="space-y-6 flex-1">
        {/* Protein Target */}
        <TargetInput
          label="Protein"
          unit="g"
          value={targets.proteinTarget}
          onChange={(v) => setTargets({ ...targets, proteinTarget: v })}
          color="bg-green-100 border-green-300"
        />

        {/* Carbs Target */}
        <TargetInput
          label="Carbs"
          unit="g"
          value={targets.carbsTarget}
          onChange={(v) => setTargets({ ...targets, carbsTarget: v })}
          color="bg-blue-100 border-blue-300"
        />

        {/* Fats Target */}
        <TargetInput
          label="Fats"
          unit="g"
          value={targets.fatsTarget}
          onChange={(v) => setTargets({ ...targets, fatsTarget: v })}
          color="bg-amber-100 border-amber-300"
        />

        {/* Calories Target */}
        <TargetInput
          label="Calories"
          unit="kcal"
          value={targets.caloriesTarget}
          onChange={(v) => setTargets({ ...targets, caloriesTarget: v })}
          color="bg-red-100 border-red-300"
        />

        {/* Water Target */}
        <TargetInput
          label="Water"
          unit="ml"
          value={targets.waterTarget}
          onChange={(v) => setTargets({ ...targets, waterTarget: v })}
          color="bg-cyan-100 border-cyan-300"
        />

        {/* Day Start Time */}
        <div className="rounded-3xl p-6 border-2 bg-purple-100 border-purple-300">
          <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2 block">
            Day Start Time
          </label>
          <p className="text-xs text-zinc-600 mb-4">
            Activities before this time are logged to the previous day
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">
                Hour
              </label>
              <input
                type="number"
                value={targets.dayCutoffHour}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  if (val >= 0 && val <= 23) {
                    setTargets({ ...targets, dayCutoffHour: val });
                  }
                }}
                className="w-full text-3xl font-bold font-heading text-foreground bg-white/50 rounded-xl px-4 py-2 border-none outline-none"
                min="0"
                max="23"
                step="1"
              />
            </div>
            <span className="text-3xl font-bold text-zinc-400 mt-6">:</span>
            <div className="flex-1">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1 block">
                Minute
              </label>
              <input
                type="number"
                value={targets.dayCutoffMinute}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  if (val >= 0 && val <= 59) {
                    setTargets({ ...targets, dayCutoffMinute: val });
                  }
                }}
                className="w-full text-3xl font-bold font-heading text-foreground bg-white/50 rounded-xl px-4 py-2 border-none outline-none"
                min="0"
                max="59"
                step="1"
              />
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            💡 Recommended: <strong>5:30 AM</strong> (aligns with circadian rhythm)
          </p>
        </div>
      </div>

      {/* Save Button */}
      <BigButton onClick={handleSave} disabled={saving} className="mt-8">
        {saving ? "Saving..." : "Save Targets"}
      </BigButton>

      {/* Logout Button */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full mt-4 mb-8 py-4 rounded-2xl bg-zinc-100 text-zinc-700 font-bold text-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}

function TargetInput({
  label,
  unit,
  value,
  onChange,
  color,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
}) {
  return (
    <div className={`rounded-3xl p-6 border-2 ${color}`}>
      <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider mb-3 block">
        {label} Target
      </label>
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 text-4xl font-bold font-heading text-foreground bg-transparent border-none outline-none"
          min="0"
          step={unit === "kcal" ? "100" : "10"}
        />
        <span className="text-2xl font-bold text-zinc-400">{unit}</span>
      </div>
    </div>
  );
}
