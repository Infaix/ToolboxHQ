"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Exam {
  id: string;
  name: string;
  subject: string;
  date: string; // ISO datetime string
  notes?: string;
}

export function useExamCountdown() {
  const [exams, setExams] = useState<Exam[]>(() => {
    if (typeof window === 'undefined') return [];
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

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    localStorage.setItem('exam-countdown-exams', JSON.stringify(exams));
  }, [exams]);

  const sortedExams = useCallback(() => {
    return exams
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exams, now]);

  const upcomingExams = useCallback(() => {
    return exams
      .filter((e) => new Date(e.date).getTime() > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exams, now]);

  const pastExams = useCallback(() => {
    return exams
      .filter((e) => new Date(e.date).getTime() <= now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [exams, now]);

  const formatCountdown = useCallback((dateString: string) => {
    const target = new Date(dateString);
    const diff = target.getTime() - now;

    if (diff <= 0) return 'Completed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, [now]);

  const addExam = useCallback((name: string, subject: string, date: string, notes?: string) => {
    setExams(prev => [...prev, { id: Date.now().toString(), name, subject, date, notes }]);
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
  const { exams, formatCountdown, addExam, removeExam } = useExamCountdown();

  const upcomingExams = exams
    .filter((e) => new Date(e.date).getTime() > Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastExams = exams
    .filter((e) => new Date(e.date).getTime() <= Date.now())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [examName, setExamName] = useState('');
  const [examSubject, setExamSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examNotes, setExamNotes] = useState('');

  const classes = {
    input: 'w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
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
            Exam Countdown
          </h1>
        </nav>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Add Exam
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Exam Name
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className={classes.input}
                aria-label="Exam name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Subject
              </label>
              <select
                value={examSubject}
                onChange={(e) => setExamSubject(e.target.value)}
                className={classes.input}
              >
                <option value="">Select subject</option>
                <option value="Mathematical Methods">Mathematical Methods</option>
                <option value="Physics">Physics</option>
                <option value="English Language">English Language</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Exam Date & Time
              </label>
              <input
                type="datetime-local"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className={classes.input}
                aria-label="Exam date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                value={examNotes}
                onChange={(e) => setExamNotes(e.target.value)}
                className={classes.input}
                placeholder="e.g. Room 3B, bring calculator"
                aria-label="Exam notes"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (examName.trim() && examSubject.trim() && examDate.trim()) {
                addExam(examName, examSubject, examDate, examNotes.trim());
                setExamName('');
                setExamSubject('');
                setExamDate('');
                setExamNotes('');
              }
            }}
            className={classes.button}
            aria-label="Add exam"
          >
            Add Exam
          </button>
        </div>

        {upcomingExams.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Upcoming Exams
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className={`${classes.card} p-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{exam.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{exam.subject}</p>
                      {exam.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{exam.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCountdown(exam.date)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(exam.date).toLocaleDateString()} {new Date(exam.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExam(exam.id)}
                    className={`${classes.ghostButton} text-red-500 dark:text-red-400 text-sm mt-2`}
                    aria-label="Remove exam"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {pastExams.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Past Exams
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {pastExams.map((exam) => (
                <div key={exam.id} className={`${classes.card} p-4 opacity-60`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{exam.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{exam.subject}</p>
                      {exam.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{exam.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-500 dark:text-gray-400">
                        Completed
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(exam.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExam(exam.id)}
                    className={`${classes.ghostButton} text-red-500 dark:text-red-400 text-sm mt-2`}
                    aria-label="Remove exam"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingExams.length === 0 && pastExams.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No exams added. Add an exam above to start the countdown.
          </p>
        )}
      </div>
    </div>
  );
}