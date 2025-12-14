"use client";

import { getUserSettings, updateUserSettings } from "@/app/actions/settings";
import { BigButton } from "@/components/ui/BigButton";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      router.back();
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
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
      </div>

      {/* Save Button */}
      <BigButton onClick={handleSave} disabled={saving} className="mt-8 mb-8">
        {saving ? "Saving..." : "Save Targets"}
      </BigButton>
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
