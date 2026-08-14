"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  analyzeGoal,
  computeAverageScore,
  hasAnyScore,
  getInvalidScores,
  MIN_SCORE,
  MAX_SCORE,
  type SubjectScore,
} from '@/lib/atar';

interface AtarGoalSubject extends SubjectScore {
  id: string;
}

const STORAGE_KEY = 'atar-goal-calculator-subjects';
const TARGET_KEY = 'atar-goal-calculator-target';

export function useAtarGoalCalculator() {
  const [subjects, setSubjects] = useState<AtarGoalSubject[]>(() => {
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

  const [targetAtar, setTargetAtar] = useState<number>(() => {
    if (typeof window === 'undefined') return 90;
    try {
      const raw = localStorage.getItem(TARGET_KEY);
      const num = raw === null ? 90 : Number(raw);
      return Number.isFinite(num) ? Math.max(0, Math.min(99.95, num)) : 90;
    } catch {
      return 90;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    } catch {
      // storage unavailable
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem(TARGET_KEY, String(targetAtar));
    } catch {
      // storage unavailable
    }
  }, [targetAtar]);

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

  const goal = analyzeGoal(subjects, targetAtar);
  const average = computeAverageScore(subjects);
  const anyScore = hasAnyScore(subjects);
  const invalidNames = getInvalidScores(subjects);

  return {
    subjects,
    addSubject,
    removeSubject,
    handleNameChange,
    handleScoreChange,
    targetAtar,
    setTargetAtar,
    goal,
    average,
    anyScore,
    invalidNames,
  };
}

export default function AtarGoalCalculatorPage() {
  const {
    subjects,
    addSubject,
    removeSubject,
    handleNameChange,
    handleScoreChange,
    targetAtar,
    setTargetAtar,
    goal,
    average,
    anyScore,
    invalidNames,
  } = useAtarGoalCalculator();

  const classes = {
    card: 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    input:
      'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    inputInvalid:
      'w-full rounded-md border border-red-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-red-500 dark:bg-gray-800 dark:text-white',
    ghostButton:
      'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    label: 'mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400',
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
              ATAR Goal Calculator
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Work out the study scores you need for your target ATAR.
            </p>
          </div>
        </nav>

        <div className={`${classes.card} mb-8`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end">
            <div>
              <label className={classes.label} htmlFor="target-atar">
                Target ATAR (0 - 99.95)
              </label>
              <input
                id="target-atar"
                type="number"
                min={0}
                max={99.95}
                step={0.05}
                value={targetAtar}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') {
                    setTargetAtar(0);
                    return;
                  }
                  const num = Number(raw);
                  if (!Number.isFinite(num)) return;
                  setTargetAtar(Math.max(0, Math.min(99.95, num)));
                }}
                className={classes.input}
                aria-label="Target ATAR"
              />
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <p className="text-xs text-gray-500 dark:text-gray-400">Required aggregate (estimate)</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{goal.targetAggregate}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Your Subjects</h2>

          {subjects.length === 0 && (
            <div className={`${classes.card} py-12 text-center`}>
              <p className="text-gray-500 dark:text-gray-400">
                Add the subjects you plan to study to see what scores you need.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {subjects.map((subject) => {
              const invalid =
                subject.studyScore !== null &&
                (subject.studyScore < MIN_SCORE || subject.studyScore > MAX_SCORE);
              return (
                <div key={subject.id} className={classes.card}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
                    <div>
                      <label className={classes.label} htmlFor={`goal-name-${subject.id}`}>
                        Subject
                      </label>
                      <input
                        id={`goal-name-${subject.id}`}
                        value={subject.name}
                        onChange={(e) => handleNameChange(subject.id, e.target.value)}
                        className={classes.input}
                        aria-label="Subject name"
                        placeholder="e.g. English"
                      />
                    </div>
                    <div>
                      <label className={classes.label} htmlFor={`goal-score-${subject.id}`}>
                        Expected Score (0-50)
                      </label>
                      <input
                        id={`goal-score-${subject.id}`}
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
                        aria-label="Expected study score (0-50)"
                      />
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
        </div>

        {invalidNames.length > 0 && (
          <div className="mb-8 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            Study scores must be between {MIN_SCORE} and {MAX_SCORE}. Please fix:{' '}
            {invalidNames.join(', ')}.
          </div>
        )}

        {anyScore && invalidNames.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900">
                <p className="text-xs text-gray-500 dark:text-gray-400">Estimated current ATAR</p>
                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {goal.currentAtar.toFixed(1)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900">
                <p className="text-xs text-gray-500 dark:text-gray-400">Average study score</p>
                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{average.toFixed(1)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900">
                <p className="text-xs text-gray-500 dark:text-gray-400">Approx. average score needed</p>
                <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {goal.requiredAverage.toFixed(1)}
                </p>
              </div>
            </div>

            <div
              className={`mt-5 rounded-md p-4 text-sm ${
                goal.onTrack
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
              }`}
            >
              {goal.onTrack ? (
                <p>
                  <strong>You appear on track.</strong> Your estimated aggregate ({goal.currentAggregate}) already
                  meets the aggregate needed for an ATAR of {targetAtar.toFixed(1)} ({goal.targetAggregate}).
                </p>
              ) : (
                <p>
                  <strong>You may need higher scores.</strong> Your estimated aggregate ({goal.currentAggregate}) is{' '}
                  {goal.gapAggregate} below the ~{goal.targetAggregate} needed for your target ATAR. Aim for an average
                  study score around <strong>{goal.requiredAverage.toFixed(1)}</strong>.
                </p>
              )}
            </div>

            <div className="mt-4 rounded-md bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
              <strong>Important:</strong> These figures are <em>estimates only</em>. ATARs are set by VTAC each year
              from <em>scaled</em> study scores (VCAA scaling varies by cohort), the VTAC aggregate formula and the
              official aggregate-to-ATAR table. Raw study scores are treated as equal to scaled scores here. Your actual
              result may differ significantly.
            </div>
          </div>
        )}

        {!anyScore && (
          <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Add subject study scores above to see how you are tracking toward your goal.
          </p>
        )}
      </div>
    </div>
  );
}
