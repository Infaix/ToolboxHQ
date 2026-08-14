"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Assessment {
  id: string;
  name: string;
  mark: number;
  maxMark: number;
  weight: number;
}

export function useGradeCalculator() {
  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('grade-calculator-assessments');
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
    localStorage.setItem('grade-calculator-assessments', JSON.stringify(assessments));
  }, [assessments]);

  const totalWeight = useCallback(() => {
    return assessments.reduce((sum, a) => sum + a.weight, 0);
  }, [assessments]);

  const weightedTotal = useCallback(() => {
    return assessments.reduce((sum, a) => sum + a.mark / a.maxMark * a.weight, 0);
  }, [assessments]);

  const overallPercentage = useCallback(() => {
    const weightSum = totalWeight();
    if (weightSum === 0 || weightSum > 100) return 0;
    return (weightedTotal() / weightSum) * 100;
  }, [totalWeight, weightedTotal]);

  const canCalculate = useCallback(() => {
    return assessments.length > 0 && totalWeight() > 0 && totalWeight() <= 100;
  }, [assessments.length, totalWeight]);

  const addAssessment = useCallback(() => {
    const newAssessment: Assessment = {
      id: Date.now().toString(),
      name: 'Unnamed Assessment',
      mark: 0,
      maxMark: 100,
      weight: 10,
    };
    setAssessments(prev => [...prev, newAssessment]);
  }, []);

  const removeAssessment = useCallback((id: string) => {
    setAssessments(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleNameChange = useCallback((id: string, name: string) => {
    setAssessments(prev =>
      prev.map(a => a.id === id ? { ...a, name: name.trim() || 'Unnamed Assessment' } : a)
    );
  }, []);

  const handleMarkChange = useCallback((id: string, mark: number) => {
    setAssessments(prev =>
      prev.map(a => a.id === id ? { ...a, mark: Math.max(0, Math.min(a.maxMark, mark)) } : a)
    );
  }, []);

  const handleMaxMarkChange = useCallback((id: string, maxMark: number) => {
    setAssessments(prev =>
      prev.map(a => a.id === id ? { ...a, maxMark: Math.max(1, maxMark) } : a)
    );
  }, []);

  const handleWeightChange = useCallback((id: string, weight: number) => {
    setAssessments(prev =>
      prev.map(a => a.id === id ? { ...a, weight: Math.max(0, Math.min(100, weight)) } : a)
    );
  }, []);

  return {
    assessments,
    setAssessments,
    totalWeight,
    weightedTotal,
    overallPercentage,
    canCalculate,
    addAssessment,
    removeAssessment,
    handleNameChange,
    handleMarkChange,
    handleMaxMarkChange,
    handleWeightChange,
  };
}

export default function GradeCalculatorPage() {
  const {
    assessments,
    totalWeight,
    overallPercentage,
    canCalculate,
    addAssessment,
    removeAssessment,
    handleNameChange,
    handleMarkChange,
    handleMaxMarkChange,
    handleWeightChange,
  } = useGradeCalculator();

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
            Grade Calculator
          </h1>
        </nav>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Assessments
          </h2>
          <div className="space-y-3">
            {assessments.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                No assessments added yet. Add your first assessment above.
              </p>
            )}
            {assessments.map((assessment) => (
              <div key={assessment.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Assessment Name
                    </label>
                    <input
                      value={assessment.name}
                      onChange={(e) => handleNameChange(assessment.id, e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      aria-label="Assessment name"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Mark
                    </label>
                    <input
                      type="number"
                      value={assessment.mark}
                      onChange={(e) => handleMarkChange(assessment.id, Number(e.target.value))}
                      min={0}
                      max={assessment.maxMark}
                      step={1}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      aria-label="Mark achieved"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Max Mark
                    </label>
                    <input
                      type="number"
                      value={assessment.maxMark}
                      onChange={(e) => handleMaxMarkChange(assessment.id, Number(e.target.value))}
                      min={1}
                      step={1}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      aria-label="Maximum mark"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Weighting
                    </label>
                    <input
                      type="number"
                      value={assessment.weight}
                      onChange={(e) => handleWeightChange(assessment.id, Number(e.target.value))}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      aria-label="Weight percentage"
                    />%
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAssessment(assessment.id)}
                    className="ml-2 bg-gray-200 dark:bg-gray-700 text-sm font-medium text-gray-800 dark:text-gray-300 rounded px-2 py-1 transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
                    aria-label="Remove assessment"
                    disabled={assessments.length <= 1}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2 text-right text-xs text-gray-500 dark:text-gray-400">
                  Contribution:{(overallPercentage() > 0 ? (
                    <span className="font-medium">
                      {(assessment.mark / assessment.maxMark * assessment.weight / totalWeight() * 100).toFixed(
                        1
                      )}%
                    </span>
                  ) : '')}&nbsp;of overall
                </div>
              </div>
            ))}
          </div>

          {assessments.length < 5 && (
            <button
              type="button"
              onClick={addAssessment}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              aria-label="Add assessment"
            >
              Add Assessment
            </button>
          )}

          {canCalculate() && (
            <div className="mt-6 rounded-xl border p-6 bg-gray-50 dark:bg-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Overall Result</h3>
              <p className="mt-1">
                Weighted overall percentage: <strong>{overallPercentage().toFixed(1)}%</strong>
              </p>
              {totalWeight() > 0 && totalWeight() <= 100 && (
                <p className="mt-1">
                  Total weighting: {totalWeight()}%{' '}
                  {totalWeight() === 100 ? (
                    ' (Complete)'
                  ) : (
                    <span className="text-blue-600">
                      {100 - totalWeight()}% remaining
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          {!canCalculate() && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Add assessments and ensure weightings total 100% to see your result.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}