"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useContext } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export function useStudyTimer() {
  const { theme } = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [workDuration, setWorkDuration] = useState(25 * 60); // 25 minutes in seconds
  const [breakDuration, setBreakDuration] = useState(5 * 60); // 5 minutes in seconds
  const [remainingTime, setRemainingTime] = useState(workDuration);
  const [sessionCount, setSessionCount] = useState(0);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && remainingTime > 0) {
      timerIdRef.current = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
      return () => {
        if (timerIdRef.current) clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      };
    } else if (remainingTime === 0 && isRunning) {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      timerIdRef.current = null;
      setIsRunning(false);
      setSessionCount(prev => prev + 1);
      // Optional: browser notification
      if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
        new Notification('Study Timer Complete', {
          body: 'Your study session is complete! Take a break.',
        });
      }
    }
  }, [isRunning, remainingTime]);

  const toggleRun = useCallback(() => {
    setIsRunning(!isRunning);
  }, [isRunning]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setRemainingTime(workDuration);
  }, [workDuration]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  return {
    isRunning,
    workDuration,
    setWorkDuration,
    breakDuration,
    setBreakDuration,
    remainingTime,
    sessionCount,
    formatTime,
    toggleRun,
    resetTimer,
  };
}

export default function StudyTimerPage() {
  const {
    isRunning,
    workDuration,
    setWorkDuration,
    breakDuration,
    setBreakDuration,
    remainingTime,
    sessionCount,
    formatTime,
    toggleRun,
    resetTimer,
  } = useStudyTimer();
  const isDark = true; // simplified for this build

  const classes = {
    input: 'w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    button: 'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700',
    ghostButton: 'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    card: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-base text-gray-600 dark:text-gray-400',
    resultCard: 'mt-6 rounded-xl border p-6 bg-gray-50 dark:bg-gray-800',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 border-b border-gray-300 pb-4">
          <Link
            href="/students"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Student Tools Hub
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Study Timer
          </h1>
        </nav>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Pomodoro Timer
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Work: {formatTime(workDuration)} / Break: {formatTime(breakDuration)}
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleRun}
              className={isRunning ? 'bg-red-500 dark:bg-red-400' : classes.button}
              aria-label={isRunning ? 'Pause' : 'Start'}
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className={classes.ghostButton}
              aria-label="Reset"
            >
              Reset
            </button>
          </div>
          <p className="mt-4 text-4xl font-bold text-gray-900 dark:text-white">
            {formatTime(remainingTime)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Work Duration (minutes)
            </label>
            <input
              type="number"
              value={workDuration / 60}
              onChange={(e) => setWorkDuration(Number(e.target.value) * 60)}
              min={1}
              className={classes.input}
              aria-label="Work duration in minutes"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Break Duration (minutes)
            </label>
            <input
              type="number"
              value={breakDuration / 60}
              onChange={(e) => setBreakDuration(Number(e.target.value) * 60)}
              min={1}
              className={classes.input}
              aria-label="Break duration in minutes"
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Session {sessionCount + 1}
          </p>
        </div>
      </div>
    </div>
  );
}