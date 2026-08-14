"use client";

import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface AtarGoalTarget {
  id: string;
  targetAtar: number;
  requiredAggregate: number;
}

interface AtarGoalSubject {
  id: string;
  name: string;
  studyScore: number | null;
}

export function useAtarGoalCalculator() {
  const { theme } = useTheme();
  const [subjects, setSubjects] = useState<AtarGoalSubject[]>(() => {
    const stored = localStorage.getItem('atar-goal-calculator-subjects');
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
    localStorage.setItem('atar-goal-calculator-subjects', JSON.stringify(subjects));
  }, [subjects]);

  const [targetAtar, setTargetAtar] = useState(90);

  const totalScore = useCallback(() => {
    return subjects.reduce((sum, s) => sum + (s.studyScore ?? 0), 0);
  }, [subjects]);

  const averageScore = useCallback(() => {
    const validScores = subjects.filter(s => s.studyScore !== null);
    if (validScores.length === 0) return 0;
    return totalScore() / validScores.length;
  }, [subjects]);

  const estimatedAggregate = useCallback(() => {
    // Simple estimate: if all subjects had the same score, what would the aggregate be
    // ATAR is calculated based on scaled study scores, so this is a rough estimate
    const validScores = subjects.filter(s => s.studyScore !== null);
    if (validScores.length === 0) return 0;
    const avg = totalScore() / validScores.length;
    // Rough estimation: higher average → higher ATAR
    // This is a very rough estimate only
    if (avg >= 40) return Math.min(99.95, 55 + (avg - 35) * 1.5);
    if (avg >= 30) return Math.min(99.95, 40 + (avg - 25) * 1.5);
    return Math.min(99.95, 25 + avg * 1.2);
  }, [subjects]);

  const addSubject = useCallback(() => {
    const newSubject: AtarGoalSubject = {
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
      prev.map(s => s.id === id ? { ...s, studyScore: Math.max(0, Math.min(50, score)) } : s)
    );
  }, []);

  const hasAnyScore = useCallback(() => {
    return subjects.some(s => s.studyScore !== null);
  }, [subjects]);

  return {
    subjects,
    setSubjects,
    targetAtar,
    setTargetAtar,
    totalScore,
    averageScore,
    estimatedAggregate,
    addSubject,
    removeSubject,
    handleNameChange,
    handleScoreChange,
    hasAnyScore,
  };
}

export default function AtarGoalCalculatorPage() {
  const {
    subjects,
    setSubjects,
    targetAtar,
    setTargetAtar,
    totalScore,
    averageScore,
    estimatedAggregate,
    addSubject,
    removeSubject,
    handleNameChange,
    handleScoreChange,
    hasAnyScore,
  } = useAtarGoalCalculator();
  const isDark = true; // simplified for this build

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
            ATAR Goal Calculator
          </h1>
        </nav>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Study Score Goals
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Target ATAR
              </label>
              <input
                type="number"
                value={targetAtar}
                onChange={(e) => setTargetAtar(Number(e.target.value))}
                min={50}
                max={99.95}
                step={0.1}
                className={numberInput}
                aria-label="Target ATAR"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Current Estimated Aggregate
              </label>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {estimatedAggregate().toFixed(1)}
              </p>
            </div>
          </div>

          {subjects.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              Add your VCE study scores to see what ATAR you might achieve.
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
                    className={input}
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
                    className={input}
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
              className={button}
              aria-label="Add subject"
            >
              Add Subject
            </button>
          )}

          {hasAnyScore() && (
            <div className="resultCard">
              <h3 className="title">ATAR Goal Analysis</h3>
              <p className="subtitle">
                Current estimated aggregate: <strong>{estimatedAggregate().toFixed(1)}</strong>
              </p>
              <p className="mt-2 subtitle">
                Average study score: <strong>{averageScore().toFixed(1)}</strong>
              </p>
              <div className="warning mt-4">
                <strong>Important:</strong> This is an <em>estimate only</em>. ATAR calculation is determined by VTAC based on VCE study scores and their scaling moderation. This calculator provides a rough estimation based on average scores and does not represent official VTAC results. Actual ATAR may vary significantly.
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Target ATAR: {targetAtar}
                {estimatedAggregate() >= targetAtar ? 'You appear on track!' : 'You may need higher scores'}
              </p>
            </div>
          )}

          {!hasAnyScore() && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Add subject study scores above to see your ATAR estimate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}