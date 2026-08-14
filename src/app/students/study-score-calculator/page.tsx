"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface StudyEntry {
  id: string;
  name: string;
  score: number | null;
  weight: number;
}

export function useStudyScoreCalculator() {
  const [subjects, setSubjects] = useState<StudyEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('study-score-calculator-subjects');
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
    localStorage.setItem('study-score-calculator-subjects', JSON.stringify(subjects));
  }, [subjects]);

  const totalWeightedScore = useCallback(() => {
    return subjects.reduce((sum, s) => sum + (s.score ?? 0) * s.weight, 0);
  }, [subjects]);

  const totalWeight = useCallback(() => {
    return subjects.reduce((sum, s) => sum + s.weight, 0);
  }, [subjects]);

  const estimatedStudyScore = useCallback(() => {
    if (totalWeight() === 0) return 0;
    return totalWeightedScore() / totalWeight();
  }, [totalWeight, totalWeightedScore]);

  const addSubject = useCallback(() => {
    const newSubject: StudyEntry = {
      id: Date.now().toString(),
      name: 'New Subject',
      score: null,
      weight: 20,
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
      prev.map(s => s.id === id ? { ...s, score: Math.max(0, Math.min(50, score)) } : s)
    );
  }, []);

  const handleWeightChange = useCallback((id: string, weight: number) => {
    setSubjects(prev =>
      prev.map(s => s.id === id ? { ...s, weight: Math.max(1, Math.min(100, weight)) } : s)
    );
  }, []);

  return {
    subjects,
    setSubjects,
    totalWeightedScore,
    totalWeight,
    estimatedStudyScore,
    addSubject,
    removeSubject,
    handleNameChange,
    handleScoreChange,
    handleWeightChange,
  };
}

export default function StudyScoreCalculatorPage() {
  const {
    subjects,
    totalWeight,
    estimatedStudyScore,
    addSubject,
    removeSubject,
    handleNameChange,
    handleScoreChange,
    handleWeightChange,
  } = useStudyScoreCalculator();

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
            Study Score Calculator
          </h1>
        </nav>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Subject Entries
          </h2>

          {subjects.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              Enter SAC/exam results with weightings to calculate an estimated study score.
            </p>
          )}

          {subjects.map((subject) => (
            <div key={subject.id} className={`${classes.card} mb-3`}>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Subject Name
                  </label>
                  <input
                    value={subject.name}
                    onChange={(e) => handleNameChange(subject.id, e.target.value)}
                    className={classes.input}
                    aria-label="Subject name"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Weight
                  </label>
                  <input
                    type="number"
                    value={subject.weight}
                    onChange={(e) => handleWeightChange(subject.id, Number(e.target.value))}
                    min={1}
                    max={100}
                    step={1}
                    className={classes.input}
                    aria-label="Weight"
                  />%
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Score
                  </label>
                  <input
                    type="number"
                    value={subject.score ?? ''}
                    onChange={(e) => {
                      const score = Number(e.target.value);
                      handleScoreChange(subject.id, score);
                    }}
                    min={0}
                    max={50}
                    step={1}
                    className={classes.input}
                    aria-label="Study score (0-50)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSubject(subject.id)}
                  className={`${classes.ghostButton} ml-2 sm:mt-0`}
                  aria-label="Remove subject"
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
              className={classes.button}
              aria-label="Add subject"
            >
              Add Subject
            </button>
          )}

          {subjects.length > 0 && (
            <div className={classes.resultCard}>
              <h3 className={classes.title}>Estimated Study Score</h3>
              <p className={classes.subtitle}>
                Weighted average: <strong>{estimatedStudyScore().toFixed(1)}</strong>
              </p>
              <p className={`mt-2 ${classes.subtitle}`}>
                Total weight: {totalWeight()}%{' '}
                {totalWeight() === 100 ? (' (Complete)') : (
                  <span className="text-blue-600">
                    {100 - totalWeight()}% remaining
                  </span>
                )}
              </p>
              <div className={`${classes.warning} mt-4`}>
                <strong>Important:</strong> This is an <em>estimate only</em>. VCAA&apos;s actual study-score calculation is more complex and depends on moderation, scaling, and individual assessment results. This calculator uses weighted averages of raw scores and does not account for all VCAA processes.
              </div>
            </div>
          )}

          {subjects.length === 0 && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Enter subject weightings and scores above to see your estimated study score.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}