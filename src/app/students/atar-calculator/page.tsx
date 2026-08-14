"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  computeAggregate,
  computeAverageScore,
  estimateAtarFromAggregate,
  hasAnyScore,
  getInvalidScores,
  scaleStudyScore,
  MIN_SCORE,
  MAX_SCORE,
  type SubjectScore,
} from '@/lib/atar';

interface SubjectEntry extends SubjectScore {
  id: string;
}

const STORAGE_KEY = 'atar-calculator-subjects';

export function useAtarCalculator() {
  const [subjects, setSubjects] = useState<SubjectEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((s) => s && typeof s === 'object')
          .map((s) => ({
            id: typeof s.id === 'string' ? s.id : String(Date.now() + Math.random()),
            name: typeof s.name === 'string' ? s.name : 'Subject',
            studyScore: typeof s.studyScore === 'number' ? s.studyScore : null,
          }));
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    } catch {
      // storage unavailable
    }
  }, [subjects]);

  const addSubject = useCallback(() => {
    setSubjects((prev) => [
      ...prev,
      { id: Date.now().toString(), name: 'New Subject', studyScore: null },
    ]);
  }, []);

  const removeSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleNameChange = useCallback((id: string, name: string) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }, []);

  const handleScoreChange = useCallback((id: string, score: number | null) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, studyScore: score } : s)));
  }, []);

  const aggregate = computeAggregate(subjects);
  const average = computeAverageScore(subjects);
  const estimatedAtar = estimateAtarFromAggregate(aggregate);
  const anyScore = hasAnyScore(subjects);
  const invalidNames = getInvalidScores(subjects);

  return {
    subjects,
    addSubject,
    removeSubject,
    handleNameChange,
    handleScoreChange,
    aggregate,
    average,
    estimatedAtar,
    anyScore,
    invalidNames,
  };
}

export default function AtarCalculatorPage() {
  const {
    subjects,
    addSubject,
    removeSubject,
    handleNameChange,
    handleScoreChange,
    aggregate,
    average,
    estimatedAtar,
    anyScore,
    invalidNames,
  } = useAtarCalculator();

  const classes = {
    card: 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    input:
      'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    inputInvalid:
      'w-full rounded-md border border-red-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-red-500 dark:bg-gray-800 dark:text-white',
    button:
      'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700',
    ghostButton:
      'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    label: 'mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-base text-gray-600 dark:text-gray-400',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
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
              ATAR Calculator
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Estimate your ATAR from VCE study scores.
            </p>
          </div>
        </nav>

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Your Subjects</h2>

          {subjects.length === 0 && (
            <div className={`${classes.card} py-12 text-center`}>
              <p className="text-gray-500 dark:text-gray-400">
                Add your VCE study scores to estimate an ATAR. Your data never leaves your device.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {subjects.map((subject) => {
              const invalid =
                subject.studyScore !== null &&
                (subject.studyScore < MIN_SCORE || subject.studyScore > MAX_SCORE);
              const scaled =
                subject.studyScore !== null ? scaleStudyScore(subject.studyScore, subject.name) : null;
              return (
                <div key={subject.id} className={classes.card}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_10rem_8rem_auto] sm:items-end">
                    <div>
                      <label className={classes.label} htmlFor={`name-${subject.id}`}>
                        Subject
                      </label>
                      <input
                        id={`name-${subject.id}`}
                        value={subject.name}
                        onChange={(e) => handleNameChange(subject.id, e.target.value)}
                        className={classes.input}
                        aria-label="Subject name"
                        placeholder="e.g. English"
                      />
                    </div>
                    <div>
                      <label className={classes.label} htmlFor={`score-${subject.id}`}>
                        Study Score (0-50)
                      </label>
                      <input
                        id={`score-${subject.id}`}
                        type="number"
                        min={MIN_SCORE}
                        max={MAX_SCORE}
                        step={1}
                        value={subject.studyScore ?? ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === '') {
                            handleScoreChange(subject.id, null);
                            return;
                          }
                          const num = Number(raw);
                          if (!Number.isFinite(num)) return;
                          handleScoreChange(subject.id, Math.max(MIN_SCORE, Math.min(MAX_SCORE, num)));
                        }}
                        className={invalid ? classes.inputInvalid : classes.input}
                        aria-label="Study score (0-50)"
                      />
                    </div>
                    <div>
                      <p className={classes.label}>Est. scaled</p>
                      <p className="py-2 text-sm text-gray-900 dark:text-white">
                        {scaled !== null ? scaled : '—'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSubject(subject.id)}
                      className={classes.ghostButton}
                      aria-label={`Remove ${subject.name}`}
                      disabled={subjects.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {subjects.length < 6 && (
            <button type="button" onClick={addSubject} className={`${classes.ghostButton} mt-4`} aria-label="Add subject">
              + Add Subject
            </button>
          )}

          {subjects.length >= 6 && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              A maximum of six subjects is used in the ATAR aggregate calculation.
            </p>
          )}
        </div>

        {invalidNames.length > 0 && (
          <div className="mb-8 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            Study scores must be between {MIN_SCORE} and {MAX_SCORE}. Please fix:{' '}
            {invalidNames.join(', ')}.
          </div>
        )}

        {anyScore && invalidNames.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="text-center sm:col-span-1">
                <p className={classes.subtitle}>Estimated ATAR</p>
                <p className="mt-1 text-5xl font-extrabold text-blue-600 dark:text-blue-400">
                  {estimatedAtar.toFixed(1)}
                </p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Estimate only</p>
              </div>
              <div className="sm:col-span-2">
                <h3 className={classes.title}>Estimated Aggregate</h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Aggregate (primary four + 10% of extras)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{aggregate}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Average study score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{average.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-md bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
              <strong>Important:</strong> This is an <em>estimate only</em>. The actual ATAR is calculated by
              VTAC from <em>scaled</em> study scores, which depend on VCAA subject scaling for your cohort each year,
              the VTAC aggregate formula, and the official aggregate-to-ATAR distribution table. This calculator uses
              raw study scores (assumed equal to scaled) and an approximate mapping, so your real ATAR may differ.
              It should not be used for official applications.
            </div>
          </div>
        )}

        {!anyScore && (
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Add subject study scores above to see your estimated ATAR.
          </p>
        )}
      </div>
    </div>
  );
}
