"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak' | 'exam' | 'custom';

interface TimerSettings {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  sessionsBeforeLongBreak: number;
  autoStartNext: boolean;
  soundEnabled: boolean;
  customMin: number;
  customBreakMin: number;
}

interface TimerSession {
  id: string;
  date: string;
  mode: TimerMode;
  subject: string;
  task: string;
  durationSec: number;
  completed: boolean;
  startedAt: number | null;
  completedAt: number | null;
}

interface DailySessionStats {
  date: string;
  sessionsCompleted: number;
  focusSeconds: number;
}

const SETTINGS_KEY = 'study-timer-settings';
const SESSIONS_KEY = 'study-timer-sessions';
const STATS_KEY = 'study-timer-stats';
const CYCLE_KEY = 'study-timer-cycle';
const SUBJECTS_KEY = 'study-timer-subjects';
const FULLSCREEN_KEY = 'study-timer-fullscreen';

const DEFAULT_SETTINGS: TimerSettings = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  sessionsBeforeLongBreak: 4,
  autoStartNext: false,
  soundEnabled: true,
  customMin: 25,
  customBreakMin: 5,
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
  exam: 'Exam Mode',
  custom: 'Custom',
};

const PRESET_MODES = {
  pomodoro: { focusMin: 25, breakMin: 5, mode: 'focus' as TimerMode },
  shortStudy: { focusMin: 45, breakMin: 10, mode: 'focus' as TimerMode },
  deepWork: { focusMin: 50, breakMin: 10, mode: 'focus' as TimerMode },
  exam: { focusMin: 90, breakMin: 0, mode: 'exam' as TimerMode },
};

function todayKey(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function getDurationSec(mode: TimerMode, settings: TimerSettings): number {
  if (mode === 'focus') return settings.focusMin * 60;
  if (mode === 'shortBreak') return settings.shortBreakMin * 60;
  if (mode === 'longBreak') return settings.longBreakMin * 60;
  if (mode === 'exam') return settings.focusMin * 60;
  return settings.customMin * 60;
}

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function loadSettings(): TimerSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<TimerSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: TimerSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // storage unavailable
  }
}

function loadStats(): DailySessionStats {
  const empty: DailySessionStats = { date: todayKey(), sessionsCompleted: 0, focusSeconds: 0 };
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<DailySessionStats>;
    if (parsed.date !== todayKey()) return empty;
    return {
      date: todayKey(),
      sessionsCompleted: typeof parsed.sessionsCompleted === 'number' ? parsed.sessionsCompleted : 0,
      focusSeconds: typeof parsed.focusSeconds === 'number' ? parsed.focusSeconds : 0,
    };
  } catch {
    return empty;
  }
}

function saveStats(stats: DailySessionStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // storage unavailable
  }
}

function loadSessions(): TimerSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    return stored ? JSON.parse(stored) as TimerSession[] : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: TimerSession[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // storage unavailable
  }
}

function loadCycleCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(CYCLE_KEY);
    const num = raw === null ? 0 : Number(raw);
    return Number.isFinite(num) && num >= 0 ? Math.floor(num) : 0;
  } catch {
    return 0;
  }
}

function saveCycleCount(count: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CYCLE_KEY, String(count));
  } catch {
    // storage unavailable
  }
}

function addSubject(subject: string) {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(SUBJECTS_KEY);
    const subjects: string[] = stored ? JSON.parse(stored) : [];
    const trimmed = subject.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      subjects.push(trimmed);
      localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
    }
  } catch {
    // storage unavailable
  }
}

function getRecentSubjects(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SUBJECTS_KEY);
    if (!stored) return [];
    const subjects = JSON.parse(stored);
    const seen = new Set();
    return subjects.filter((s: string) => !seen.has(s) && seen.add(s));
  } catch {
    return [];
  }
}

// Fullscreen helper
function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = (element: HTMLElement | null) => {
    if (!element) return;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(() => {
        setIsFullscreen(false);
      });
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen.call(element);
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen.call(element);
    }
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    if ((document as any).exitFullscreen) {
      ;(document as any).exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      ;(document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      ;(document as any).msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  useEffect(() => {
    const handleChange = () => {
      const fsElement = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement;
      setIsFullscreen(!!fsElement);
    };
    ;(document as any).addEventListener('fullscreenchange', handleChange);
    ;(document as any).addEventListener('webkitfullscreenchange', handleChange);
    ;(document as any).addEventListener('msfullscreenchange', handleChange);
    return () => {
      ;(document as any).removeEventListener('fullscreenchange', handleChange);
      ;(document as any).removeEventListener('webkitfullscreenchange', handleChange);
      ;(document as any).removeEventListener('msfullscreenchange', handleChange);
    };
  }, []);

  return { isFullscreen, enterFullscreen, exitFullscreen };
}

export default function StudyTimerPage() {
  // Settings state
  const [settings, setSettings] = useState<TimerSettings>(loadSettings);
  const [stats, setStats] = useState<DailySessionStats>(loadStats);
  const [sessions, setSessions] = useState<TimerSession[]>(loadSessions);
  const [cycleCount, setCycleCount] = useState(loadCycleCount);
  const [recentSubjects, setRecentSubjectsState] = useState(getRecentSubjects);

  // Timer state using timestamp-based counting for accuracy with browser throttling
  const [mode, setMode] = useState<TimerMode>('focus');
  const [remainingSec, setRemainingSec] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [subject, setSubject] = useState<string>('');
  const [task, setTask] = useState<string>('');

  // Load planner config on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const plannerConfig = localStorage.getItem('study-planner-task-config');
      if (plannerConfig) {
        const config = JSON.parse(plannerConfig);
        if (config.subject) setSubject(config.subject);
        if (config.task) setTask(config.task);
        if (config.durationMin) {
          setSettings((prev) => ({ ...prev, focusMin: config.durationMin }));
          setRemainingSec(config.durationMin * 60);
        }
        // Clear the config after loading
        localStorage.removeItem('study-planner-task-config');
      }
    } catch {
      // ignored
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer refs for timestamp-based counting
  const startTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef<number>(0);

  // Fullscreen state
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();

  // Complete session callback
  const completeSession = useCallback(() => {
    setIsRunning(false);
    setShowCompletion(true);

    // Save completed session
    const newSession: TimerSession = {
      id: Date.now().toString(),
      date: todayKey(),
      mode,
      subject: subject || 'General',
      task: task || 'Study session',
      durationSec: settings.focusMin * 60,
      completed: true,
      startedAt: Date.now() - settings.focusMin * 60 * 1000,
      completedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev.slice(0, 9)]);
    setRecentSubjectsState((prev) => {
      const already = new Set(prev);
      if (!already.has(subject || 'General')) prev.push(subject || 'General');
      return prev;
    });

    // Update stats
    setStats((prev) => ({
      ...prev,
      sessionsCompleted: prev.sessionsCompleted + 1,
      focusSeconds: prev.focusSeconds + (settings.focusMin * 60),
    }));
    setCycleCount((prev) => prev + 1);

    // Play chime sound
    if (settings.soundEnabled) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 660;
        gain.gain.value = 0.1;
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        setTimeout(() => ctx.close(), 500);
      } catch {
        // audio unavailable
      }
    }

    // Show notification
    if (typeof Notification !== 'undefined') {
      const permission = (Notification as any).permission;
      if (permission === 'granted') {
        try {
          new Notification('Focus session complete', { body: 'Great work! Time for a break.' });
        } catch {
          // notification failed
        }
      } else if (permission !== 'denied') {
        try {
          (Notification as any).requestPermission().then((perm: string) => {
            if (perm === 'granted') {
              new Notification('Focus session complete', { body: 'Great work! Time for a break.' });
            }
          });
        } catch {
          // notification failed
        }
      }
    }
  }, [settings, subject, task]);

  // Initialize timer state from settings and mode
  useEffect(() => {
    const duration = getDurationSec(mode, settings);
    setRemainingSec(duration);
    startTimeRef.current = null;
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;
  }, [mode, settings]);

  // Timer effect - timestamp based for accuracy with browser throttling
  useEffect(() => {
    if (!isRunning) {
      if (startTimeRef.current !== null && pausedAtRef.current === null) {
        pausedAtRef.current = Date.now();
      }
      return;
    }

    // Starting or resuming
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
      pausedAtRef.current = null;
      totalPausedTimeRef.current = 0;
    } else if (pausedAtRef.current !== null) {
      totalPausedTimeRef.current += (Date.now() - pausedAtRef.current);
      pausedAtRef.current = null;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - (startTimeRef.current || now) - totalPausedTimeRef.current;
      const totalDuration = getDurationSec(mode, settings) * 1000;
      const remainingMs = Math.max(0, totalDuration - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);

      setRemainingSec(remainingSec);

      if (remainingSec <= 0) {
        clearInterval(interval);
        setIsRunning(false);
        completeSession();
      }
    }, 100); // Update every 100ms for smooth UI

    return () => {
      clearInterval(interval);
      if (isRunning && pausedAtRef.current === null) {
        pausedAtRef.current = Date.now();
      }
    };
  }, [isRunning, mode, settings, completeSession]);

  // Switch mode and reset timer
  const switchMode = useCallback((nextMode: TimerMode) => {
    setIsRunning(false);
    setMode(nextMode);
    const duration = getDurationSec(nextMode, settings);
    setRemainingSec(duration);
    startTimeRef.current = null;
    pausedAtRef.current = null;
    totalPausedTimeRef.current = 0;
  }, [settings]);

  // Handle session end - move to next mode
  const handleSessionEnd = useCallback(() => {
    setIsRunning(false);
    const newCycle = cycleCount + 1;
    const nextMode: TimerMode =
      newCycle % settings.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak';
    setMode(nextMode);
    setRemainingSec(getDurationSec(nextMode, settings));
    startTimeRef.current = Date.now();

    // Save session
    const newSession: TimerSession = {
      id: Date.now().toString(),
      date: todayKey(),
      mode,
      subject: subject || 'General',
      task: task || 'Study session',
      durationSec: settings.focusMin * 60,
      completed: true,
      startedAt: Date.now() - settings.focusMin * 60 * 1000,
      completedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev.slice(0, 9)]);
    setRecentSubjectsState((prev) => {
      const already = new Set(prev);
      if (!already.has(subject || 'General')) prev.push(subject || 'General');
      return prev;
    });

    // Update stats
    setStats((prev) => ({
      ...prev,
      sessionsCompleted: prev.sessionsCompleted + 1,
      focusSeconds: prev.focusSeconds + (settings.focusMin * 60),
    }));
    setCycleCount((prev) => prev + 1);
  }, [settings, cycleCount, mode, subject, task, setRecentSubjectsState, setStats, setSessions]);

  // Sync stats to localStorage
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // Sync sessions to localStorage
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Sync settings to localStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Sync cycle count to localStorage
  useEffect(() => {
    saveCycleCount(cycleCount);
  }, [cycleCount]);

  // Format stats
  const focusMinutesToday = Math.floor(stats.focusSeconds / 60);
  const focusSecondsToday = stats.focusSeconds % 60;

  // Find current (non-completed) session
  const currentSession = sessions.find((s) => !s.completed) || {
    id: '', mode: 'focus' as TimerMode, subject: '', task: '', durationSec: 0, completed: false, startedAt: null, completedAt: null,
  };
  const currentSessionNum = sessions.filter((s) => !s.completed).length;
  const totalSessionsCompleted = sessions.filter((s) => s.completed).length;

  // Mode buttons
  const modeButtons = (
    <div className="grid grid-cols-1 gap-2 mb-6 sm:grid-cols-3">
      {(Object.keys(PRESET_MODES) as (keyof typeof PRESET_MODES)[]).map((key) => {
        const preset = PRESET_MODES[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => switchMode(preset.mode)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              mode === preset.mode
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            aria-pressed={mode === preset.mode}
          >
            {key === 'pomodoro' ? 'Pomodoro' : key === 'shortStudy' ? 'Short Study' : key === 'deepWork' ? 'Deep Work' : 'Exam Mode'}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => setMode('custom')}
        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          mode === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
        aria-pressed={mode === 'custom'}
      >
        Custom
      </button>
    </div>
  );

  // Controls
  const controls = (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => setIsRunning(prev => !prev)}
        className={isRunning ? 'inline-flex items-center justify-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-red-600 text-white hover:bg-red-700' : 'inline-flex items-center justify-center gap-1 rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white'}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button
        type="button"
        onClick={() => {
          setIsRunning(false);
          const duration = getDurationSec(mode, settings);
          setRemainingSec(duration);
          startTimeRef.current = null;
          pausedAtRef.current = null;
          totalPausedTimeRef.current = 0;
        }}
        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label="Reset timer"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={() => {
          setIsRunning(false);
          const newCycle = cycleCount + 1;
          const nextMode: TimerMode =
            newCycle % settings.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak';
          setMode(nextMode);
          const duration = getDurationSec(nextMode, settings);
          setRemainingSec(duration);
          startTimeRef.current = null;
          pausedAtRef.current = null;
          totalPausedTimeRef.current = 0;
        }}
        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label="Skip to next session"
      >
        Skip
      </button>
    </div>
  );

  // Settings panel
  const [showSettings, setShowSettings] = useState(false);

  const settingsPanel = showSettings && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowSettings(false)}>
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl transform transition-opacity duration-300" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Timer Settings</h2>
        
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Focus duration (min)
            </label>
            <input
              type="number"
              min={1}
              max={120}
              value={settings.focusMin}
              onChange={(e) => {
                const v = Math.max(1, Math.min(120, Number(e.target.value)));
                setSettings((prev) => ({ ...prev, focusMin: v }));
                setRemainingSec(getDurationSec(mode, { ...settings, focusMin: v }));
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Short break (min)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={settings.shortBreakMin}
              onChange={(e) => {
                const v = Math.max(1, Math.min(30, Number(e.target.value)));
                setSettings((prev) => ({ ...prev, shortBreakMin: v }));
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Long break (min)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={settings.longBreakMin}
              onChange={(e) => {
                const v = Math.max(1, Math.min(30, Number(e.target.value)));
                setSettings((prev) => ({ ...prev, longBreakMin: v }));
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Sessions before long break
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={settings.sessionsBeforeLongBreak}
              onChange={(e) => {
                const v = Math.max(1, Math.min(20, Number(e.target.value)));
                setSettings((prev) => ({ ...prev, sessionsBeforeLongBreak: v }));
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Auto-start next
            </label>
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 cursor-pointer ${
              settings.autoStartNext ? 'bg-blue-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400' : ''
            }">
              <input
                type="checkbox"
                checked={settings.autoStartNext}
                onChange={(e) => setSettings((prev) => ({ ...prev, autoStartNext: e.target.checked }))}
                className="rounded accent-blue-600 dark:accent-blue-500"
              />
              Yes
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Sound
            </label>
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 cursor-pointer ${
              settings.soundEnabled ? 'bg-blue-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400' : ''
            }">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings((prev) => ({ ...prev, soundEnabled: e.target.checked }))}
                className="rounded accent-blue-600 dark:accent-blue-500"
              />
              On
            </label>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowSettings(false)}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(false)}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            aria-label="Save settings"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  // Custom duration controls
  const customControls = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
          Study duration (minutes)
        </label>
        <input
          type="number"
          min={1}
          max={120}
          value={settings.customMin}
          onChange={(e) => {
            const v = Math.max(1, Math.min(120, Number(e.target.value)));
            setSettings((prev) => ({ ...prev, customMin: v }));
            const nextSettings = { ...settings, customMin: v };
            setRemainingSec(getDurationSec('custom' as TimerMode, nextSettings));
          }}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          aria-label="Custom study duration in minutes"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
          Break duration (minutes)
        </label>
        <input
          type="number"
          min={1}
          max={30}
          value={settings.customBreakMin}
          onChange={(e) => {
            const v = Math.max(1, Math.min(30, Number(e.target.value)));
            setSettings((prev) => ({ ...prev, customBreakMin: v }));
          }}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          aria-label="Custom break duration in minutes"
        />
      </div>
    </div>
  );

  // Session completion state
  const [showCompletion, setShowCompletion] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          <Link
            href="/students"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Student Tools Hub
          </Link>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Study Timer
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pomodoro timer with Focus, Short Break and Long Break sessions.
            </p>
          </div>
        </nav>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-10">
            {/* Subject and Task Input */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Physics"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  list="subject-suggestions"
                />
                <datalist id="subject-suggestions">
                  <option value="Mathematical Methods" />
                  <option value="Physics" />
                  <option value="English Language" />
                  <option value="Vietnamese" />
                  <option value="Chemistry" />
                  <option value="Biology" />
                </datalist>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Task
                </label>
                <input
                  type="text"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="e.g. Waves revision"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-2">
              {(Object.keys(MODE_LABELS) as TimerMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    mode === m
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  aria-pressed={mode === m}
                >
                  {MODE_LABELS[m]}
                </button>
              ))}
            </div>

            <div className="mt-8">{controls}</div>
          </div>
        </div>

        {/* Timer display - prominent when in fullscreen or normal view */}
        <div className="mt-6 flex flex-col items-center gap-4">
          {/* Fullscreen toggle */}
          {isFullscreen && (
            <button
              type="button"
              onClick={exitFullscreen}
              className="absolute top-4 right-4 rounded-full bg-black/70 p-2 text-white hover:bg-black/90 transition-colors"
              aria-label="Exit fullscreen"
            >
              ✕
            </button>
          )}
          {!isFullscreen && (
            <button
              type="button"
              onClick={() => enterFullscreen(document.getElementById('timer-container') as HTMLElement | null)}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Full screen"
            >
              Full Screen
            </button>
          )}

          {/* Subject and task info */}
          {subject || task ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {subject && <span className="font-medium text-gray-900 dark:text-white">{subject}</span>}{subject && task ? ' - ' : ''}{task || ''}
            </div>
          ) : null}

          {/* Mode label */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {MODE_LABELS[mode]}
          </div>

          {/* Countdown - large and prominent */}
          <div id="timer-container" className="relative">
            <span className="text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {formatTime(remainingSec)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${(1 - remainingSec / getDurationSec(mode, settings)) * 100}%` }}
            />
          </div>

          {/* Session number */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Session {cycleCount + 1} of {settings.sessionsBeforeLongBreak}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Open settings"
          >
            Settings
          </button>
          {showSettings && settingsPanel}
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Session</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{currentSessionNum}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed Today</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{totalSessionsCompleted}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Focus Time Today</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {focusMinutesToday}:{String(focusSecondsToday).padStart(2, '0')}
            </p>
          </div>
        </div>

        {/* Session completion state */}
        {showCompletion && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full transform transition-opacity duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Session Complete</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {subject || 'Study'} — {task || 'session'} finished
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {formatTime(settings.focusMin * 60)} studied
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompletion(false);
                    // Move to break
                    const newCycle = cycleCount + 1;
                    const nextMode: TimerMode =
                      newCycle % settings.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak';
                    setMode(nextMode);
                    const duration = getDurationSec(nextMode, settings);
                    setRemainingSec(duration);
                    startTimeRef.current = null;
                    pausedAtRef.current = null;
                    totalPausedTimeRef.current = 0;
                    if (settings.autoStartNext) {
                      setIsRunning(true);
                    }
                  }}
                  className="button flex-1"
                  aria-label="Start break"
                >
                  Start Break
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCompletion(false);
                    // Start another study session
                    setMode('focus');
                    const duration = getDurationSec('focus', settings);
                    setRemainingSec(duration);
                    startTimeRef.current = null;
                    pausedAtRef.current = null;
                    totalPausedTimeRef.current = 0;
                    if (settings.autoStartNext) {
                      setIsRunning(true);
                    }
                  }}
                  className="button flex-1"
                  aria-label="Start another session"
                >
                  Study Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auto-start break or next session after completion */}
        {isRunning || totalSessionsCompleted > 0 && (
          <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
            The timer tracks elapsed time using timestamps, so it stays accurate even when the browser tab is in the background. Everything is stored locally on your device.
          </p>
        )}
      </div>
    </div>
  );
}