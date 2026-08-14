"use client";

import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface GPASubject {
  id: string;
  name: string;
  gradePoints: number; // 0-4.0 scale
  credits: number;
}

export function useGPACalculator() {
  const { theme } = useTheme();
  const [subjects, setSubjects] = useState<GPASubject[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('gpa-calculator-subjects');
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
    localStorage.setItem('gpa-calculator-subjects', JSON.stringify(subjects));
  }, [subjects]);

  const weightedSum = useCallback(() => {
    return subjects.reduce((sum, s) => sum + s.gradePoints * s.credits, 0);
  }, [subjects]);

  const totalCredits = useCallback(() => {
    return subjects.reduce((sum, s) => sum + s.credits, 0);
  }, [subjects]);

  const gpa = useCallback(() => {
    if (totalCredits() === 0) return 0;
    return weightedSum() / totalCredits();
  }, [subjects]);

  const addSubject = useCallback(() => {
    const newSubject: GPASubject = {
      id: Date.now().toString(),
      name: 'New Subject',
      gradePoints: 3.0,
      credits: 1,
    };
    setSubjects(prev => [...prev, newSubject]);
  }, []);

  const removeSubject = useCallback((id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleNameChange = useCallback((id: string, name: string) => {
    setSubjects(prev =>
      prev.map(s => s.id === id ? { ...s, name: name.trim() } : s)
    );
  }, []);

  const handleGradeChange = useCallback((id: string, gradePoints: number) => {
    setSubjects(prev =>
      prev.map(s => s.id === id ? { ...s, gradePoints: Math.max(0, Math.min(4, gradePoints)) } : s)
    );
  }, []);

  const handleCreditsChange = useCallback((id: string, credits: number) => {
    setSubjects(prev =>
      prev.map(s => s.id === id ? { ...s, credits: Math.max(1, credits) } : s)
    );
  }, []);

  return {
    subjects,
    setSubjects,
    weightedSum,
    totalCredits,
    gpa,
    addSubject,
    removeSubject,
    handleNameChange,
    handleGradeChange,
    handleCreditsChange,
  };
}

export default function GPACalculatorPage() {
  const { theme } = useTheme();
  const isDark = true; // simplified for this build

  const {
    subjects,
    setSubjects,
    weightedSum,
    totalCredits,
    gpa,
    addSubject,
    removeSubject,
    handleNameChange,
    handleGradeChange,
    handleCreditsChange,
  } = useGPACalculator();

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
    warning: 'mt-4 p-4 rounded-md bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    numberInput: 'w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
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
            GPA Calculator
          </h1>
        </nav>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            GPA Calculation
          </h2>

          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            This calculator uses a {totalCredits() > 0 ? (
              `${totalCredits()} credit${totalCredits() !== 1 ? 's' : ''} GPA scale`
            ) : (
              '4.0 scale'
            )}. Your GPA is calculated by dividing the total weighted grade points by total credits.
          </p>

          {subjects.length === 0 && (
            <p className="mb-4 text-gray-500 dark:text-gray-400 text-sm text-center">
              Add subjects with grades and credit values to calculate your GPA.
            </p>
          )}

          {subjects.map((subject) => (
            <div key={subject.id} className="card mb-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Subject Name
                  </label>
                  <input
                    value={subject.name}
                    onChange={(e) => handleNameChange(subject.id, e.target.value)}
                    defaultValue={subject.name}
                    className={classes.input}
                    aria-label="Subject name"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Grade (0-4.0)
                  </label>
                  <input
                    type="number"
                    value={subject.gradePoints}
                    onChange={(e) => handleGradeChange(subject.id, Number(e.target.value))}
                    min={0}
                    max={4}
                    step={0.1}
                    className={classes.input}
                    aria-label="Grade points"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    value={subject.credits}
                    onChange={(e) => handleCreditsChange(subject.id, Number(e.target.value))}
                    min={1}
                    step={1}
                    className={classes.input}
                    aria-label="Credits"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSubject(subject.id)}
                  className="ghostButton ml-2 sm:mt-0"
                  aria-label="Remove subject"
                  disabled={subjects.length <= 1}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {subjects.length < 30 && (
            <button
              type="button"
              onClick={addSubject}
              className={classes.button}
              aria-label="Add subject"
            >
              Add Subject
            </button>
          )}

          {totalCredits() > 0 && (
            <div className="resultCard">
              <h3 className="title">GPA Result</h3>
              <p className="subtitle">
                GPA: <strong>{gpa().toFixed(2)}</strong> on a {totalCredits() > 0 ? ('4.0 scale') : ('4.0 scale')}
              </p>
              <p className="mt-2 subtitle">
                Total weighted points: {weightedSum().toFixed(2)} /
                {totalCredits()} credits
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {totalCredits() > 0 ? (
                  `Each point represents one grade unit multiplied by course credits. A 4.0 scale assigns 4 points for an A, 3 for a B, 2 for a C, 1 for a D, and 0 for an F.`
                ) : (
                  'Add subjects with grades and credits to calculate your GPA.'
                )}
              </p>
            </div>
          )}

          {subjects.length === 0 && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Add subjects with grades and credit values to calculate your GPA.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}