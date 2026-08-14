"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StudySession {
  completed: boolean;
}

interface FlashcardProgress {
  totalCards: number;
  knownCards: number;
}

interface DashboardData {
  studySessions: StudySession[];
  flashcardProgress: FlashcardProgress;
  studyTimeMinutes: number;
}

const EMPTY_DATA: DashboardData = {
  studySessions: [],
  flashcardProgress: { totalCards: 0, knownCards: 0 },
  studyTimeMinutes: 0,
};

function loadDashboardData(): DashboardData {
  if (typeof window === 'undefined') return EMPTY_DATA;
  try {
    const sessionsStored = localStorage.getItem('study-timer-sessions');
    const studySessions = sessionsStored
      ? (JSON.parse(sessionsStored) as StudySession[])
      : [];

    const decksStored = localStorage.getItem('flashcards-decks');
    let flashcardProgress: FlashcardProgress = { totalCards: 0, knownCards: 0 };
    if (decksStored) {
      const decks: { cards?: { known?: boolean }[] }[] = JSON.parse(decksStored);
      let totalCards = 0;
      let knownCards = 0;
      decks.forEach((deck) => {
        deck.cards?.forEach((card) => {
          totalCards++;
          if (card.known) knownCards++;
        });
      });
      flashcardProgress = { totalCards, knownCards };
    }

    const studyTimeStored = localStorage.getItem('study-planner-study-time');
    const studyTimeMinutes = studyTimeStored
      ? Number(JSON.parse(studyTimeStored))
      : 0;

    return { studySessions, flashcardProgress, studyTimeMinutes };
  } catch {
    return EMPTY_DATA;
  }
}

export function useFocusDashboard() {
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);

  useEffect(() => {
    const refresh = () => setData(loadDashboardData());
    const initial = window.setTimeout(refresh, 0);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    const id = window.setInterval(refresh, 5000);
    return () => {
      window.clearTimeout(initial);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
      window.clearInterval(id);
    };
  }, []);

  return data;
}

export default function FocusDashboardPage() {
  const { studySessions, flashcardProgress, studyTimeMinutes } = useFocusDashboard();

  const totalHours = Math.floor(studyTimeMinutes / 60);
  const remainingMinutes = studyTimeMinutes % 60;
  const completedSessions = studySessions.filter((s) => s.completed).length;
  const totalSessions = studySessions.length;

  const knownCardPercentage = flashcardProgress.totalCards > 0
    ? Math.round((flashcardProgress.knownCards / flashcardProgress.totalCards) * 100)
    : 0;

  const classes = {
    statCard: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 text-center',
    statNumber: 'text-3xl font-bold text-gray-900 dark:text-white',
    statLabel: 'mt-1 text-sm text-gray-500 dark:text-gray-400',
  };

  const stats = [
    { number: totalHours, label: 'Total Study Hours' },
    { number: `${totalHours}h ${remainingMinutes}m`, label: 'Total Study Time' },
    { number: completedSessions, label: 'Completed Sessions' },
    { number: totalSessions, label: 'Study Sessions' },
    { number: flashcardProgress.totalCards, label: 'Flashcards' },
    { number: `${knownCardPercentage}%`, label: 'Flashcard Mastery' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-8 border-b border-gray-200 pb-4 dark:border-gray-700">
          <Link
            href="/students"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Student Tools Hub
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Focus Dashboard
          </h1>
        </nav>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className={classes.statCard}>
              <div className={classes.statNumber}>{stat.number}</div>
              <div className={classes.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <footer className="mt-10 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <p>All data is stored locally in your browser. No cloud syncing or account required.</p>
        </footer>
      </div>
    </div>
  );
}
