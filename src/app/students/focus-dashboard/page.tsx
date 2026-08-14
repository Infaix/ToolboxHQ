"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface StudySession {
  completed: boolean;
}

export function useFocusDashboard() {
  const { theme } = useTheme();

  // Read data from localStorage used by other student tools
  const getStudySessions = (): StudySession[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('study-timer-sessions');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  };

  const getFlashcardProgress = () => {
    if (typeof window === 'undefined') return { totalCards: 0, knownCards: 0 };
    const stored = localStorage.getItem('flashcards-decks');
    if (stored) {
      try {
        const decks: { name: string; cards: { known: boolean }[] }[] = JSON.parse(stored);
        let totalCards = 0;
        let knownCards = 0;
        decks.forEach((deck) => {
          deck.cards.forEach((card) => {
            totalCards++;
            if (card.known) knownCards++;
        });
        });
        return { totalCards, knownCards };
      } catch {
        return { totalCards: 0, knownCards: 0 };
      }
    }
    return { totalCards: 0, knownCards: 0 };
  };

  const getStudyTime = () => {
    if (typeof window === 'undefined') return 0;
    const stored = localStorage.getItem('study-planner-study-time');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return 0;
      }
    }
    return 0;
  };

  return {
    studySessions: getStudySessions(),
    flashcardProgress: getFlashcardProgress(),
    studyTime: getStudyTime(),
  };
}

export default function FocusDashboardPage() {
  const { studySessions, flashcardProgress, studyTime } = useFocusDashboard();
  const isDark = true; // simplified for this build

  const totalStudyMinutes = studyTime;
  const totalHours = Math.floor(totalStudyMinutes / 60);
  const remainingMinutes = totalStudyMinutes % 60;

  const completedSessions = studySessions.filter((s) => s.completed).length;
  const totalSessions = studySessions.length;

  const knownCardPercentage = flashcardProgress.totalCards > 0
    ? Math.round((flashcardProgress.knownCards / flashcardProgress.totalCards) * 100)
    : 0;

  const classes = {
    card: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-base text-gray-600 dark:text-gray-400',
    statCard: 'bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-center',
    statNumber: 'text-2xl font-bold text-gray-900 dark:text-white',
    statLabel: 'text-sm text-gray-500 dark:text-gray-400',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <Link
            href="/students"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-700 dark:hover:text-gray-200"
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
            Focus Dashboard
          </h1>
        </nav>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card statCard">
            <div className="statNumber">{totalHours}</div>
            <div className="statLabel">Total Study Hours</div>
          </div>
          <div className="card statCard">
            <div className="statNumber">{completedSessions}</div>
            <div className="statLabel">Completed Sessions</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card statCard">
            <div className="statNumber">{flashcardProgress.totalCards}</div>
            <div className="statLabel">Flashcards</div>
          </div>
          <div className="card statCard">
            <div className="statNumber">{completedSessions}</div>
            <div className="statLabel">Completed Sessions</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card statCard">
            <div className="statNumber">{knownCardPercentage}%</div>
            <div className="statLabel">Flashcard Mastery</div>
          </div>
          <div className="card statCard">
            <div className="statNumber">{totalStudyMinutes}</div>
            <div className="statLabel">Study Minutes</div>
          </div>
        </div>

        <footer className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>All data is stored locally in your browser. No cloud syncing or account required.</p>
        </footer>
      </div>
    </div>
  );
}