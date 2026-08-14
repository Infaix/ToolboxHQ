"use client";

import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface Exam {
  id: string;
  name: string;
  subject: string;
  date: string; // ISO datetime string
}

export function useExamCountdown() {
  const { theme } = useTheme();
  const [exams, setExams] = useState<Exam[]>(() => {
    const stored = localStorage.getItem('exam-countdown-exams');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('exam-countdown-exams', JSON.stringify(exams));
  }, [exams]);

  const sortedExams = useCallback(() => {
    return exams
      .filter((e) => new Date(e.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exams]);

  const formatCountdown = useCallback((dateString: string) => {
    const target = new Date(dateString);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return 'Exam today!';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  const addExam = useCallback((name: string, subject: string, date: string) => {
    setExams(prev => [...prev, { id: Date.now().toString(), name, subject, date }]);
  }, []);

  const removeExam = useCallback((id: string) => {
    setExams(prev => prev.filter((e) => e.id !== id));
  }, []);

  return {
    exams,
    setExams,
    sortedExams,
    formatCountdown,
    addExam,
    removeExam,
  };
}

export default function ExamCountdownPage() {
  const { theme } = useTheme();
  const isDark = true; // simplified for this build

  const {
    exams,
    setExams,
    sortedExams,
    formatCountdown,
    addExam,
    removeExam,
  } = useExamCountdown();

  const classes = {
    input: `w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white`,
    row: 'flex items-center gap-2',
    cell: 'flex-1 min-w-0',
    label: 'text-sm font-medium text-gray-600 dark:text-gray-400',
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
            Exam Countdown
          </h1>
        </nav>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Add Exam
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Exam Name
              </label>
              <input
                type="text"
                className={input}
                aria-label="Exam name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Subject
              </label>
              <select className={input}>
                <option value="">Select subject</option>
                <option value="Maths">Maths</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Exam Date
              </label>
              <input
                type="datetime-local"
                className={input}
                aria-label="Exam date"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                // Would need state to capture inputs
                alert('Exam addition - implement form capture');
              }}
            >
              Add Exam
            </button>
          </div>
        </div>

        {sortedExams().length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Upcoming Exams
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {sortedExams().map((exam) => (
                <div key={exam.id} className="card p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{exam.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{exam.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCountdown(exam.date)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExam(exam.id)}
                    className="ghostButton text-red-500 dark:text-red-400 text-sm mt-2"
                    aria-label="Remove exam"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedExams().length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No exams added. Add an exam above to start the countdown.
          </p>
        )}
      </div>
    </div>
  );
}