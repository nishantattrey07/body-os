"use client";

import { getMuscleDistribution, getRecentSessions, getWeeklyFrequency, getWorkoutStats } from "@/app/actions/analytics";
import { motion } from "framer-motion";
import {
    Calendar as CalendarIcon,
    CheckCircle,
    Clock,
    Flame,
    Star,
    Target,
    TrendingUp,
    Trophy,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";

interface WorkoutSession {
  id: string;
  date: Date | string;
  routineName: string;
  status: string;
  exerciseCount: number;
  setCount: number;
  duration: number | null;
  overallRating: number | null;
}

// Color palette for muscle regions
const REGION_COLORS: Record<string, string> = {
  Chest: "bg-red-500",
  Back: "bg-blue-500",
  Shoulders: "bg-purple-500",
  Arms: "bg-amber-500",
  Core: "bg-green-500",
  Legs: "bg-teal-500",
};

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [muscleData, setMuscleData] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, weekly, muscle, sessions] = await Promise.all([
        getWorkoutStats(30),
        getWeeklyFrequency(8),
        getMuscleDistribution(30),
        getRecentSessions(5),
      ]);
      setStats(statsData);
      setWeeklyData(weekly);
      setMuscleData(muscle);
      setRecentSessions(sessions as WorkoutSession[]);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <div className="animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  const maxWeekly = Math.max(...weeklyData.map(w => w.workouts), 1);
  const totalMusclesets = muscleData.reduce((acc, m) => acc + m.sets, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={Flame}
          label="Streak"
          value={stats?.streak || 0}
          unit="days"
          color="orange"
        />
        <StatCard
          icon={Trophy}
          label="This Week"
          value={stats?.workoutsThisWeek || 0}
          unit="workouts"
          color="blue"
        />
        <StatCard
          icon={Target}
          label="Total Sets"
          value={stats?.totalSets || 0}
          unit="30 days"
          color="green"
        />
        <StatCard
          icon={Star}
          label="Avg Rating"
          value={stats?.avgRating || 0}
          unit="/5"
          color="amber"
        />
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Weekly Activity</h3>
          <span className="text-xs text-zinc-400">Last 8 weeks</span>
        </div>
        
        <div className="flex items-end gap-2 h-32">
          {weeklyData.map((week, i) => (
            <motion.div
              key={week.week}
              initial={{ height: 0 }}
              animate={{ height: `${(week.workouts / maxWeekly) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div 
                className={`w-full rounded-t-lg transition-colors ${
                  week.workouts === 0 
                    ? "bg-zinc-100" 
                    : week.workouts >= 3 
                    ? "bg-gradient-to-t from-green-500 to-green-400" 
                    : "bg-gradient-to-t from-blue-500 to-blue-400"
                }`}
                style={{ 
                  height: week.workouts === 0 ? "8px" : "100%",
                  minHeight: "8px"
                }}
              />
            </motion.div>
          ))}
        </div>
        
        <div className="flex gap-2 mt-2">
          {weeklyData.map((week) => (
            <div key={week.week} className="flex-1 text-center">
              <p className="text-xs text-zinc-400">{week.week}</p>
              <p className="text-xs font-bold text-foreground">{week.workouts}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Muscle Distribution */}
      {muscleData.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Muscle Focus</h3>
            <span className="text-xs text-zinc-400">Last 30 days</span>
          </div>
          
          <div className="space-y-3">
            {muscleData.map((muscle, i) => {
              const percentage = totalMusclesets > 0 
                ? Math.round((muscle.sets / totalMusclesets) * 100) 
                : 0;
              
              return (
                <div key={muscle.region} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">{muscle.region}</span>
                    <span className="font-bold text-foreground">
                      {muscle.sets} sets <span className="text-zinc-400 font-normal">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className={`h-full rounded-full ${REGION_COLORS[muscle.region] || "bg-zinc-400"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Recent Workouts</h3>
            <CalendarIcon size={18} className="text-zinc-400" />
          </div>
          
          <div className="space-y-3">
            {recentSessions.map((session) => {
              const date = new Date(session.date);
              const isToday = new Date().toDateString() === date.toDateString();
              const isYesterday = new Date(Date.now() - 86400000).toDateString() === date.toDateString();
              
              let dateLabel = date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              });
              if (isToday) dateLabel = "Today";
              if (isYesterday) dateLabel = "Yesterday";

              return (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      session.status === "COMPLETED" 
                        ? "bg-green-100" 
                        : session.status === "ABANDONED" 
                        ? "bg-red-100" 
                        : "bg-amber-100"
                    }`}>
                      {session.status === "COMPLETED" ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : session.status === "ABANDONED" ? (
                        <XCircle size={20} className="text-red-600" />
                      ) : (
                        <Clock size={20} className="text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{session.routineName}</p>
                      <p className="text-xs text-zinc-400">{dateLabel}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-foreground">{session.setCount} sets</p>
                    {session.duration && (
                      <p className="text-xs text-zinc-400">{session.duration} min</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats?.totalWorkouts === 0 && (
        <div className="bg-zinc-50 rounded-3xl p-8 text-center">
          <TrendingUp size={48} className="mx-auto text-zinc-300 mb-4" />
          <p className="font-bold text-zinc-600">No workout data yet</p>
          <p className="text-sm text-zinc-400 mt-1">
            Complete your first workout to see analytics
          </p>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: number; 
  unit: string; 
  color: string;
}) {
  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    orange: { bg: "bg-orange-50", icon: "text-orange-500", text: "text-orange-600" },
    blue: { bg: "bg-blue-50", icon: "text-blue-500", text: "text-blue-600" },
    green: { bg: "bg-green-50", icon: "text-green-500", text: "text-green-600" },
    amber: { bg: "bg-amber-50", icon: "text-amber-500", text: "text-amber-600" },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`${colors.bg} rounded-2xl p-4 border border-zinc-100`}
    >
      <Icon size={20} className={colors.icon} />
      <p className="text-3xl font-bold text-foreground mt-2">
        {value}
        <span className="text-sm font-normal text-zinc-400 ml-1">{unit}</span>
      </p>
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
    </motion.div>
  );
}
