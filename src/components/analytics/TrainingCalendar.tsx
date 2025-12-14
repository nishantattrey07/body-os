"use client";

import { getTrainingCalendar } from "@/app/actions/analytics";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Dumbbell, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface CalendarSession {
  id: string;
  date: Date | string;
  status: string;
  routineName: string;
  setsCompleted: number;
  overallRating: number | null;
}

export function TrainingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarSession | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    loadCalendarData();
  }, [year, month]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const data = await getTrainingCalendar(year, month);
      setSessions(data as CalendarSession[]);
    } catch (error) {
      console.error("Failed to load calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  // Generate calendar grid
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = firstDayOfMonth.getDay(); // 0 = Sunday

  const days = [];
  
  // Empty cells for days before the 1st
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const getSessionForDay = (day: number): CalendarSession | undefined => {
    return sessions.find((s) => {
      const sessionDate = new Date(s.date);
      return sessionDate.getDate() === day;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() + 1 === month && 
           today.getDate() === day;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-zinc-600" />
        </button>
        
        <h3 className="font-bold text-lg text-foreground">
          {monthName} {year}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <ChevronRight size={20} className="text-zinc-600" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs font-medium text-zinc-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }

          const session = getSessionForDay(day);
          const hasWorkout = !!session;
          const isComplete = session?.status === "COMPLETED";
          const today = isToday(day);

          return (
            <motion.button
              key={day}
              whileTap={{ scale: 0.95 }}
              onClick={() => session && setSelectedDay(session)}
              className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all relative ${
                hasWorkout
                  ? isComplete
                    ? "bg-gradient-to-br from-green-500 to-green-600 text-white"
                    : "bg-amber-100 text-amber-700"
                  : today
                  ? "bg-blue-100 text-blue-600"
                  : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {day}
              {hasWorkout && isComplete && session.overallRating && session.overallRating >= 4 && (
                <Star 
                  size={8} 
                  className="absolute top-1 right-1 text-yellow-300 fill-yellow-300" 
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-gradient-to-br from-green-500 to-green-600" />
          <span className="text-xs text-zinc-500">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-amber-100" />
          <span className="text-xs text-zinc-500">Incomplete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-blue-100" />
          <span className="text-xs text-zinc-500">Today</span>
        </div>
      </div>

      {/* Session Detail Popup */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-zinc-50 rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                selectedDay.status === "COMPLETED" ? "bg-green-100" : "bg-amber-100"
              }`}>
                <Dumbbell className={
                  selectedDay.status === "COMPLETED" ? "text-green-600" : "text-amber-600"
                } size={20} />
              </div>
              <div>
                <p className="font-bold text-foreground">{selectedDay.routineName}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(selectedDay.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedDay(null)}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              Close
            </button>
          </div>
          
          <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-200">
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-foreground">{selectedDay.setsCompleted}</p>
              <p className="text-xs text-zinc-500">Sets</p>
            </div>
            {selectedDay.overallRating && (
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                  {selectedDay.overallRating}
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                </p>
                <p className="text-xs text-zinc-500">Rating</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-3xl">
          <p className="text-zinc-400">Loading...</p>
        </div>
      )}
    </div>
  );
}
