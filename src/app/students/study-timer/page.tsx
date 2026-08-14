"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  sessionsBeforeLongBreak: number;
  autoStartNext: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

interface DailyStats {
  date: string;
  sessionsCompleted: number;
  focusSeconds: number;
}

interface BannerMessage {
  title: string;
  body: string;
}

const SETTINGS_KEY = 'study-timer-settings';
const STATS_KEY = 'study-timer-stats';
const CYCLE_KEY = 'study-timer-cycle';

const DEFAULT_SETTINGS: TimerSettings = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  sessionsBeforeLongBreak: 4,
  autoStartNext: false,
  soundEnabled: true,
  notificationsEnabled: false,
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
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
  return settings.longBreakMin * 60;
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

function loadStats(): DailyStats {
  const empty: DailyStats = { date: todayKey(), sessionsCompleted: 0, focusSeconds: 0 };
  if (typeof window === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<DailyStats>;
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

export function useStudyTimer() {
  const [settings, setSettings] = useState<TimerSettings>(loadSettings);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSec, setRemainingSec] = useState(() => getDurationSec('focus', settings));
  const [stats, setStats] = useState<DailyStats>(loadStats);
  const [cycleCount, setCycleCount] = useState(loadCycleCount);
  const [banner, setBanner] = useState<BannerMessage | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const endAtRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // storage unavailable
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // storage unavailable
    }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem(CYCLE_KEY, String(cycleCount));
    } catch {
      // storage unavailable
    }
  }, [cycleCount]);

  const playChime = useCallback(() => {
    if (!settings.soundEnabled) return;
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const notes = [660, 660, 880];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + i * 0.28;
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.2, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
      window.setTimeout(() => {
        void ctx.close();
      }, 1500);
    } catch {
      // audio unavailable
    }
  }, [settings.soundEnabled]);

  const notify = useCallback(
    (title: string, body: string) => {
      if (!settings.notificationsEnabled) return;
      if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, { body });
        } catch {
          // notification failed
        }
      }
    },
    [settings.notificationsEnabled]
  );

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        // permission request failed
      }
    }
  }, []);

  const completeSession = useCallback(() => {
    setIsRunning(false);
    if (endAtRef.current !== null) endAtRef.current = null;
    setRemainingSec(0);

    if (mode === 'focus') {
      setStats((prev) => ({
        ...prev,
        sessionsCompleted: prev.sessionsCompleted + 1,
        focusSeconds: prev.focusSeconds + settings.focusMin * 60,
      }));
      const newCycle = cycleCount + 1;
      setCycleCount(newCycle);
      const nextMode: TimerMode =
        newCycle % settings.sessionsBeforeLongBreak === 0 ? 'longBreak' : 'shortBreak';
      const nextDuration = getDurationSec(nextMode, settings);
      setMode(nextMode);
      setRemainingSec(nextDuration);
      setBanner({
        title: 'Focus session complete',
        body: nextMode === 'longBreak' ? 'Time for a well-earned long break.' : 'Time for a short break.',
      });
      playChime();
      notify(
        'Focus session complete',
        nextMode === 'longBreak' ? 'Great work! Time for a long break.' : 'Great work! Time for a short break.'
      );
      if (settings.autoStartNext) {
        endAtRef.current = Date.now() + nextDuration * 1000;
        setIsRunning(true);
      }
    } else {
      const nextDuration = getDurationSec('focus', settings);
      setMode('focus');
      setRemainingSec(nextDuration);
      setBanner({ title: 'Break finished', body: 'Ready for the next focus session?' });
      playChime();
      notify('Break finished', 'Ready for the next focus session?');
      if (settings.autoStartNext) {
        endAtRef.current = Date.now() + nextDuration * 1000;
        setIsRunning(true);
      }
    }
  }, [mode, cycleCount, settings, playChime, notify]);

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      const endAt = endAtRef.current;
      if (endAt === null) return;
      const next = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      if (next === 0) {
        completeSession();
        return;
      }
      setRemainingSec(next);
    }, 250);
    return () => window.clearInterval(id);
  }, [isRunning, completeSession]);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 6000);
    return () => window.clearTimeout(t);
  }, [banner]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleRun = useCallback(() => {
    if (isRunning) {
      if (endAtRef.current !== null) endAtRef.current = null;
      setIsRunning(false);
    } else {
      if (remainingSec === 0) {
        setRemainingSec(getDurationSec(mode, settings));
      }
      endAtRef.current = Date.now() + (remainingSec === 0 ? getDurationSec(mode, settings) : remainingSec) * 1000;
      setIsRunning(true);
    }
  }, [isRunning, remainingSec, mode, settings]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    if (endAtRef.current !== null) endAtRef.current = null;
    setRemainingSec(getDurationSec(mode, settings));
  }, [mode, settings]);

  const skipSession = useCallback(() => {
    setIsRunning(false);
    if (endAtRef.current !== null) endAtRef.current = null;
    const nextMode: TimerMode = mode === 'focus' ? 'shortBreak' : 'focus';
    setMode(nextMode);
    setRemainingSec(getDurationSec(nextMode, settings));
  }, [mode, settings]);

  const switchMode = useCallback(
    (nextMode: TimerMode) => {
      setIsRunning(false);
      if (endAtRef.current !== null) endAtRef.current = null;
      setMode(nextMode);
      setRemainingSec(getDurationSec(nextMode, settings));
    },
    [settings]
  );

  const adjustTime = useCallback((deltaSec: number) => {
    setRemainingSec((prev) => {
      const next = Math.max(1, Math.min(prev + deltaSec, 3 * 60 * 60));
      if (endAtRef.current !== null) {
        endAtRef.current += deltaSec * 1000;
      }
      return next;
    });
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<TimerSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        if (!isRunning) {
          setRemainingSec(getDurationSec(mode, next));
        }
        return next;
      });
    },
    [isRunning, mode]
  );

  const toggleFullscreen = useCallback(async () => {
    setFullscreenError(null);
    try {
      if (!document.fullscreenElement) {
        if (!document.documentElement.requestFullscreen) {
          setFullscreenError('Fullscreen is not supported by this browser.');
          return;
        }
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      setFullscreenError('Could not enter fullscreen. It may be blocked by your browser.');
    }
  }, []);

  const durationSec = getDurationSec(mode, settings);
  const progress = Math.round(((durationSec - remainingSec) / durationSec) * 100);

  return {
    settings,
    updateSettings,
    mode,
    switchMode,
    isRunning,
    remainingSec,
    durationSec,
    progress,
    stats,
    cycleCount,
    banner,
    setBanner,
    isFullscreen,
    fullscreenError,
    toggleFullscreen,
    showSettings,
    setShowSettings,
    toggleRun,
    resetTimer,
    skipSession,
    adjustTime,
    requestNotificationPermission,
    formatTime,
  };
}

const buttonClasses =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
const primaryButton = `${buttonClasses} bg-blue-600 text-white shadow-sm hover:bg-blue-700`;
const ghostButton = `${buttonClasses} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700`;
const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white';

function SettingsModal({
  settings,
  onSave,
  onClose,
  requestNotificationPermission,
}: {
  settings: TimerSettings;
  onSave: (patch: Partial<TimerSettings>) => void;
  onClose: () => void;
  requestNotificationPermission: () => void;
}) {
  const [draft, setDraft] = useState<TimerSettings>(settings);

  const setNumber = (key: 'focusMin' | 'shortBreakMin' | 'longBreakMin' | 'sessionsBeforeLongBreak') => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      if (Number.isFinite(value)) {
        setDraft((prev) => ({ ...prev, [key]: Math.max(1, value) }));
      }
    };
  };

  const handleToggleNotifications = () => {
    const next = !draft.notificationsEnabled;
    setDraft((prev) => ({ ...prev, notificationsEnabled: next }));
    if (next) {
      requestNotificationPermission();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Timer settings"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Timer Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="Close settings"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                Focus (minutes)
              </label>
              <input type="number" min={1} max={180} value={draft.focusMin} onChange={setNumber('focusMin')} className={inputClass} aria-label="Focus duration in minutes" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                Short break (minutes)
              </label>
              <input type="number" min={1} max={60} value={draft.shortBreakMin} onChange={setNumber('shortBreakMin')} className={inputClass} aria-label="Short break duration in minutes" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                Long break (minutes)
              </label>
              <input type="number" min={1} max={120} value={draft.longBreakMin} onChange={setNumber('longBreakMin')} className={inputClass} aria-label="Long break duration in minutes" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                Sessions before long break
              </label>
              <input type="number" min={1} max={12} value={draft.sessionsBeforeLongBreak} onChange={setNumber('sessionsBeforeLongBreak')} className={inputClass} aria-label="Sessions before long break" />
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-start next session</span>
              <input
                type="checkbox"
                checked={draft.autoStartNext}
                onChange={(e) => setDraft((prev) => ({ ...prev, autoStartNext: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Play sound when session ends</span>
              <input
                type="checkbox"
                checked={draft.soundEnabled}
                onChange={(e) => setDraft((prev) => ({ ...prev, soundEnabled: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Browser notifications</span>
              <input
                type="checkbox"
                checked={draft.notificationsEnabled}
                onChange={handleToggleNotifications}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={ghostButton}>
            Cancel
          </button>
          <button type="button" onClick={() => onSave(draft)} className={primaryButton}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

function TimerFace({
  mode,
  remainingSec,
  progress,
  isRunning,
  large,
}: {
  mode: TimerMode;
  remainingSec: number;
  progress: number;
  isRunning: boolean;
  large: boolean;
}) {
  return (
    <div className="text-center">
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
          mode === 'focus'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
            : mode === 'shortBreak'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
              : 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200'
        }`}
      >
        {MODE_LABELS[mode]}
      </span>
      <div className={large ? 'mt-6 text-8xl font-bold tracking-tight tabular-nums sm:text-9xl' : 'mt-4 text-6xl font-bold tracking-tight tabular-nums sm:text-7xl'}>
        <span className={mode === 'focus' ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'}>
          {formatTime(remainingSec)}
        </span>
      </div>
      <div className="mx-auto mt-6 h-2 w-full max-w-md overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${
            mode === 'focus' ? 'bg-blue-600' : mode === 'shortBreak' ? 'bg-emerald-500' : 'bg-violet-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(100, Math.max(0, progress))}
          aria-label="Session progress"
        />
      </div>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        {isRunning ? 'Session in progress' : 'Timer ready'}
      </p>
    </div>
  );
}

export default function StudyTimerPage() {
  const timer = useStudyTimer();

  const {
    settings,
    updateSettings,
    mode,
    switchMode,
    isRunning,
    remainingSec,
    progress,
    stats,
    banner,
    setBanner,
    isFullscreen,
    fullscreenError,
    toggleFullscreen,
    showSettings,
    setShowSettings,
    toggleRun,
    resetTimer,
    skipSession,
    adjustTime,
    requestNotificationPermission,
  } = timer;

  const currentSession = stats.sessionsCompleted + 1;
  const focusMinutesToday = Math.floor(stats.focusSeconds / 60);
  const focusSecondsToday = stats.focusSeconds % 60;

  const controls = (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={toggleRun} className={isRunning ? `${buttonClasses} bg-red-600 text-white hover:bg-red-700` : primaryButton} aria-label={isRunning ? 'Pause timer' : 'Start timer'}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button type="button" onClick={resetTimer} className={ghostButton} aria-label="Reset timer">
        Reset
      </button>
      <button type="button" onClick={skipSession} className={ghostButton} aria-label="Skip to next session">
        Skip
      </button>
      <button type="button" onClick={() => adjustTime(-60)} className={ghostButton} aria-label="Subtract one minute">
        −1 min
      </button>
      <button type="button" onClick={() => adjustTime(60)} className={ghostButton} aria-label="Add one minute">
        +1 min
      </button>
    </div>
  );

  const statsRow = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">Current Session</p>
        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{currentSession}</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">Completed Today</p>
        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.sessionsCompleted}</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">Focus Time Today</p>
        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {focusMinutesToday}:{String(focusSecondsToday).padStart(2, '0')}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-8 border-b border-gray-200 pb-4 dark:border-gray-700">
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

            <TimerFace mode={mode} remainingSec={remainingSec} progress={progress} isRunning={isRunning} large={false} />

            <div className="mt-8">{controls}</div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={() => setShowSettings(true)} className={ghostButton} aria-label="Open settings">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Settings
            </button>
            <button type="button" onClick={toggleFullscreen} className={ghostButton} aria-label="Toggle fullscreen">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
              </svg>
              {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            </button>
          </div>

          {fullscreenError && (
            <div className="mt-4 rounded-md bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
              {fullscreenError}
            </div>
          )}

          <div className="mt-6">{statsRow}</div>

          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Today&apos;s Settings</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Focus</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{settings.focusMin} min</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Short break</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{settings.shortBreakMin} min</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Long break</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{settings.longBreakMin} min</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Long break after</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{settings.sessionsBeforeLongBreak} sessions</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Auto-start next</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{settings.autoStartNext ? 'On' : 'Off'}</dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Sound</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{settings.soundEnabled ? 'On' : 'Off'}</dd>
              </div>
            </dl>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
            The timer tracks elapsed time using timestamps, so it stays accurate even when the browser tab is in the
            background. Everything is stored locally on your device.
          </p>
        </div>
      </div>

      {banner && (
        <div
          className="fixed inset-x-0 top-4 z-40 mx-auto w-fit max-w-md rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-lg dark:border-emerald-900 dark:bg-emerald-950"
          role="status"
        >
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-emerald-900 dark:text-emerald-100">{banner.title}</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">{banner.body}</p>
            </div>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="rounded p-1 text-emerald-600 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900"
              aria-label="Dismiss notification"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={(patch) => {
            updateSettings(patch);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
          requestNotificationPermission={requestNotificationPermission}
        />
      )}

      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 px-6 dark:bg-gray-900">
          <TimerFace mode={mode} remainingSec={remainingSec} progress={progress} isRunning={isRunning} large />
          <div className="mt-10">{controls}</div>
          <button type="button" onClick={toggleFullscreen} className={`${ghostButton} mt-8`} aria-label="Exit fullscreen">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
            </svg>
            Exit fullscreen (Esc)
          </button>
          {fullscreenError && (
            <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">{fullscreenError}</p>
          )}
        </div>
      )}
    </div>
  );
}
