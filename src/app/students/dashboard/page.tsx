"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface StudyStats {
  totalSeconds: number;
  sessionsCompleted: number;
  currentStreak: number;
  previousStreak: number;
  subjectBreakdown: Record<string, number>;
}

interface Exam {
  id: string;
  name: string;
  subject: string;
  date: string;
}

interface FlashcardDeck {
  id: string;
  name: string;
  icon: string;
  cardCount: number;
  knownCount: number;
}

// Load from localStorage
function loadStudyStats(): StudyStats {
  const empty: StudyStats = { totalSeconds: 0, sessionsCompleted: 0, currentStreak: 0, previousStreak: 0, subjectBreakdown: {} };
  if (typeof window === 'undefined') return empty;
  try {
    const stored = localStorage.getItem('study-dashboard-stats');
    if (!stored) return empty;
    return JSON.parse(stored);
  } catch {
    return empty;
  }
}

function todayKey(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function saveStudyStats(stats: StudyStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('study-dashboard-stats', JSON.stringify(stats));
  } catch {
    // storage unavailable
  }
}

// Calculate subject breakdown from timer sessions
function calculateSubjectBreakdown(sessions: any[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  sessions.forEach((session: any) => {
    if (session.completed) {
      const subject = session.subject || 'General';
      breakdown[subject] = (breakdown[subject] || 0) + (session.durationSec || 0);
    }
  });
  return breakdown;
}

// Calculate study streak from completed sessions
function calculateStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;

  const completedSessions = sessions.filter((s: any) => s.completed && s.date);
  if (completedSessions.length === 0) return 0;

  const uniqueDates = Array.from(new Set(completedSessions.map((s: any) => s.date))).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  const today = todayKey();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // Check if the most recent session is today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterdayKey) {
    return 0;
  }

  // Count consecutive days
  let currentDate = new Date(uniqueDates[0]);
  streak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;

    if (uniqueDates[i] === prevKey) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

function formatTimeSecs(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export default function StudyDashboardPage() {
  const [stats, setStats] = useState<StudyStats>(loadStudyStats);
  const [todaySeconds, setTodaySeconds] = useState(0);
  const [recentSubjects, setRecentSubjects] = useState<string[]>([]);
  const [recentDecks, setRecentDecks] = useState<FlashcardDeck[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);

  // Sync stats to localStorage
  useEffect(() => {
    saveStudyStats(stats);
  }, [stats]);

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load timer sessions for real statistics
    const sessionsStored = localStorage.getItem('study-timer-sessions');
    if (sessionsStored) {
      try {
        const sessions = JSON.parse(sessionsStored);
        const completedSessions = sessions.filter((s: any) => s.completed);

        // Calculate today's study time
        const todaySessions = completedSessions.filter((s: any) => s.date === todayKey());
        const todayTime = todaySessions.reduce((sum: number, s: any) => sum + (s.durationSec || 0), 0);
        setTodaySeconds(todayTime);

        // Calculate overall stats
        const totalTime = completedSessions.reduce((sum: number, s: any) => sum + (s.durationSec || 0), 0);
        const streak = calculateStreak(sessions);
        const breakdown = calculateSubjectBreakdown(completedSessions);

        setStats({
          totalSeconds: totalTime,
          sessionsCompleted: completedSessions.length,
          currentStreak: streak,
          previousStreak: 0,
          subjectBreakdown: breakdown,
        });
      } catch {
        // ignored
      }
    }

    // Load recent subjects from timer
    const subjectsStored = localStorage.getItem('study-timer-subjects');
    if (subjectsStored) {
      try {
        const subjects = JSON.parse(subjectsStored);
        const seen = new Set();
        setRecentSubjects(subjects.filter((s: string) => !seen.has(s) && seen.add(s)));
      } catch {
        // ignored
      }
    }

    // Load recent decks from flashcards
    const decksStored = localStorage.getItem('flashcards-decks');
    if (decksStored) {
      try {
        const decks = JSON.parse(decksStored) as FlashcardDeck[];
        setRecentDecks(decks.map((deck: any) => ({
          id: deck.id,
          name: deck.name,
          icon: deck.icon || '🃏',
          cardCount: deck.cards?.length || 0,
          knownCount: deck.cards?.filter((c: any) => c.known).length || 0,
        })));
      } catch {
        // ignored
      }
    }

    // Load upcoming exams
    const examsStored = localStorage.getItem('exam-countdown-exams');
    if (examsStored) {
      try {
        const exams = JSON.parse(examsStored) as Exam[];
        const now = Date.now();
        setUpcomingExams(
          exams.filter((e: Exam) => new Date(e.date).getTime() > now)
            .sort((a: Exam, b: Exam) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3)
        );
      } catch {
        // ignored
      }
    }
  }, []);

  // Format stats
  const todayLabel = formatTimeSecs(todaySeconds);
  const totalLabel = formatTimeSecs(stats.totalSeconds);
  const streakLabel = stats.currentStreak > 0 ? `${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}` : 'Start your first session';

  // Quick tools
  const quickTools = [
    { name: 'Study Timer', href: '/students/study-timer', icon: '⏱️', description: 'Start focused study sessions' },
    { name: 'Flashcards', href: '/students/flashcards', icon: '🃏', description: 'Create and study decks' },
    { name: 'Notes', href: '/students/notes', icon: '📝', description: 'Take and organize notes' },
    { name: 'Quiz Maker', href: '/students/quiz-maker', icon: '📝', description: 'Create and practice quizzes' },
    { name: 'ATAR Calculator', href: '/students/atar-calculator', icon: '📊', description: 'Estimate your ATAR' },
    { name: 'Maths Formulas', href: '/students/maths-formulas', icon: '📚', description: 'VCE formula reference' },
    { name: 'Physics Formulas', href: '/students/physics-formulas', icon: '📖', description: 'VCE Physics formulas' },
  ];

  // Study session stats from timer sessions
  const totalSessionsCompleted = stats.sessionsCompleted;
  const focusMinutesToday = Math.floor(todaySeconds / 60);
  const focusSecondsToday = todaySeconds % 60;

  // Subject breakdown for display
  const subjectEntries = Object.entries(stats.subjectBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([subject, seconds]) => ({
      subject,
      minutes: Math.floor(seconds / 60),
    }));

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
              Study Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your study progress at a glance
            </p>
          </div>
        </nav>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Today's Study */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4l10 8L12 26l-10 2L12 2z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">Today's Study</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{todayLabel}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Session time accumulated today</p>
          </div>

          {/* Sessions */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2S16 14 16 14" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">Sessions</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{totalSessionsCompleted}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Study sessions completed</p>
          </div>

          {/* Streak */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center text-xl">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4l2 8l2-8M12 22v-4l-2-8l2 8M4.93 4.93l2.83 2.83l1.414-1.414L12 7l8 8 1.414-1.414A11.95 11.95 0 0 1 12 3c-6.63 0-13 5.37-13 13 0 2.06.38 4.11 1.09 6.05l-1.742 1.738c.13.13.26.26.4.4l1.457-1.457L12 21l4.95-4.95a9.96 9.96 0 0 1-5.08-1.37l-1.738-1.738c-.72-.72-1.06-1.78-1.06-2.83 0-1.89-.86-3.65-2.03-4.42l-1.25-1.25Z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">Streak</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{streakLabel}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Consecutive days studying</p>
          </div>

          {/* Start Studying CTA */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = '/students/study-timer'} role="button" aria-label="Start study timer">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 1 20 21 12 12 4 21" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">Start Studying</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Begin a focused session</p>
              </div>
            </div>
          </div>

          {/* Recent Subjects */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Recent Subjects</h3>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {recentSubjects.slice(0, 4).map((subject: string, i: number) => (
                <span key={i} className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {subject}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Decks */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Recent Decks</h3>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {recentDecks.slice(0, 3).map((deck: FlashcardDeck, i: number) => (
                <span key={i} className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {deck.icon} {deck.name.substring(0, 6)}
                </span>
              ))}
              {recentDecks.length < 3 && (
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-gray-400 dark:text-gray-500" aria-label="Add a deck to see recent ones">+</span>
              )}
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Upcoming Exams</h3>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {upcomingExams.map((exam: Exam, i: number) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-900 text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">{exam.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{exam.subject}</span>
                  <span className="text-gray-400 dark:text-gray-500">{new Date(exam.date).toLocaleDateString()}</span>
                </div>
              ))}
              {upcomingExams.length === 0 && (
                <span className="text-gray-400 dark:text-gray-500 text-sm italic">No exams added</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Tools + Subjects section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-semibold text-gray-900 dark:text-white mb-4">Quick Tools</h3>
            {quickTools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="flex items-center gap-3 py-2 px-3 rounded-md border border-gray-300 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white hover:bg-gray-100 transition-colors">
                <span className="text-xl">{tool.icon}</span>
                <span>{tool.name}</span>
              </Link>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-semibold text-gray-900 dark:text-white mb-4">Your Subjects</h3>
            {subjectEntries.length > 0 ? (
              <div className="space-y-2">
                {subjectEntries.map(({ subject, minutes }) => (
                  <div key={subject} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{subject}</span>
                    <span className="text-gray-500 dark:text-gray-400">{minutes} min</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Start studying to see your subjects</p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>All data is stored locally in your browser. No account or cloud sync required.</p>
        </div>
      </div>
    </div>
  );
}