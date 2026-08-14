"use client";

import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface SubjectEntry {
  id: string;
  name: string;
  studyScore: number | null;
}

export function useAtarCalculator() {
  const { theme } = useTheme();
  const [subjects, setSubjects] = useState<SubjectEntry[]>(() => {
    const stored = localStorage.getItem('atar-calculator-subjects');
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
    localStorage.setItem('atar-calculator-subjects', JSON.stringify(subjects));
  }, [subjects]);

  const totalScore = useCallback(() => {
    return subjects.reduce((sum, s) => sum + (s.studyScore || 0), 0);
  }, [subjects]);

  const averageScore = useCallback(() => {
    const validScores = subjects.filter(s => s.studyScore !== null);
    if (validScores.length === 0) return 0;
    return totalScore() / validScores.length;
  }, [subjects]);

  const addSubject = useCallback(() => {
    const newSubject: SubjectEntry = {
      id: Date.now().toString(),
      name: 'New Subject',
      studyScore: null,
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

  const handleScoreChange = useCallback((id: string, score: number) => {
    setSubjects(prev =>
      prev.map(s => s.id === id ? { ...s, studyScore: score } : s)
    );
  }, []);

  const hasAnyScore = useCallback(() => {
    return subjects.some(s => s.studyScore !== null);
  }, [subjects]);

  return {
    subjects,
    setSubjects,
    totalScore,
    averageScore,
    addSubject,
    removeSubject,
    handleNameChange,
    handleScoreChange,
    hasAnyScore,
    theme,
  };
}

export default function AtarCalculatorPage() {
  const {
    subjects,
    setSubjects,
    totalScore,
    averageScore,
    addSubject,
    removeSubject,
    handleNameChange,
    handleScoreChange,
    hasAnyScore,
    theme,
  } = useAtarCalculator();
  const isDark = theme === 'dark';

  const classes = {
    input: `w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white`,
    row: 'flex items-center gap-2',
    cell: 'flex-1 min-w-0',
    label: 'text-sm font-medium text-gray-600 dark:text-gray-400',
    button: 'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700',
    ghostButton: 'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    card: `rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800`,
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-base text-gray-600 dark:text-gray-400',
    resultCard: 'mt-6 rounded-xl border p-6 bg-gray-50 dark:bg-gray-800',
    warning: 'mt-4 p-4 rounded-md bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    emptyState: 'text-center py-12 text-gray-500 dark:text-gray-400',
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
            ATAR Calculator
          </h1>
        </nav>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Subject Entries
          </h2>

          {subjects.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              Add your VCE study scores to calculate an estimated aggregate.
            </p>
          )}

          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="card mb-3"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Subject Name
                  </label>
                  <input
                    value={subject.name}
                    onChange={(e) => handleNameChange(subject.id, e.target.value)}
                    defaultValue={subject.name}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    disabled={hasAnyScore()}
                    aria-label="Subject name"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Study Score
                  </label>
                  <input
                    type="number"
                    value={subject.studyScore ?? ''}
                    onChange={(e) => {
                      const score = Number(e.target.value);
                      handleScoreChange(subject.id, score);
                    }}
                    min={0}
                    max={50}
                    step={1}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    disabled={hasAnyScore()}
                    aria-label="Study score (0-50)"
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

          {subjects.length < 6 && (
            <button
              type="button"
              onClick={addSubject}
              className="ghostButton ml-2 sm:mt-0"
              aria-label="Add subject"
            >
              Add Subject
            </button>
          )}

          {hasAnyScore() && (
            <div className="resultCard">
              <h3 className="title">Estimated Aggregate</h3>
              <p className="subtitle">
                Total study score: <strong>{totalScore()}</strong> / {subjects.length * 50}
              </p>
              <p className="mt-2 subtitle">
                Average study score: <strong>{averageScore().toFixed(1)}</strong>
              </p>
              <div className="warning mt-4">
                <strong>Important:</strong> This is an <em>estimate only</em>. Actual VCE scaling and ATAR calculation are determined by VTAC. This calculator uses raw study scores and does not account for subject scaling, moderation, or other VTAC processes.
              </div>
            </div>
          )}

          {!hasAnyScore() && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Add subject study scores above to see your estimated aggregate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}