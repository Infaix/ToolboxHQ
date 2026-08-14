"use client";

import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface WeightedEntry {
  id: string;
  value: number;
  weight: number;
}

export function useWeightedAverage() {
  const { theme } = useTheme();
  const [entries, setEntries] = useState<WeightedEntry[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('weighted-average-entries');
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
    localStorage.setItem('weighted-average-entries', JSON.stringify(entries));
  }, [entries]);

  const totalWeight = useCallback(() => {
    return entries.reduce((sum, e) => sum + e.weight, 0);
  }, [entries]);

  const weightedSum = useCallback(() => {
    return entries.reduce((sum, e) => sum + e.value * e.weight, 0);
  }, [entries]);

  const average = useCallback(() => {
    if (totalWeight() === 0) return 0;
    return weightedSum() / totalWeight();
  }, [entries]);

  const addEntry = useCallback(() => {
    const newEntry: WeightedEntry = {
      id: Date.now().toString(),
      value: 50,
      weight: 10,
    };
    setEntries(prev => [...prev, newEntry]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleValueChange = useCallback((id: string, value: number) => {
    setEntries(prev =>
      prev.map(e => e.id === id ? { ...e, value: Math.max(0, value) } : e)
    );
  }, []);

  const handleWeightChange = useCallback((id: string, weight: number) => {
    setEntries(prev =>
      prev.map(e => e.id === id ? { ...e, weight: Math.max(0, weight) } : e)
    );
  }, []);

  return {
    entries,
    setEntries,
    totalWeight,
    weightedSum,
    average,
    addEntry,
    removeEntry,
    handleValueChange,
    handleWeightChange,
  };
}

export default function WeightedAveragePage() {
  const { theme } = useTheme();
  const isDark = true; // simplified for this build

  const {
    entries,
    setEntries,
    totalWeight,
    weightedSum,
    average,
    addEntry,
    removeEntry,
    handleValueChange,
    handleWeightChange,
  } = useWeightedAverage();

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
            Weighted Average Calculator
          </h1>
        </nav>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Weighted Average
          </h2>

          {entries.length === 0 && (
            <p className="mb-4 text-gray-500 dark:text-gray-400 text-sm text-center">
              Enter values and their corresponding weights to calculate a weighted average.
            </p>
          )}

          {entries.map((entry) => (
            <div key={entry.id} className="card mb-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    value={entry.value}
                    onChange={(e) => handleValueChange(entry.id, Number(e.target.value))}
                    className={classes.input}
                    aria-label="Value"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Weight
                  </label>
                  <input
                    type="number"
                    value={entry.weight}
                    onChange={(e) => handleWeightChange(entry.id, Number(e.target.value))}
                    min={0}
                    step={1}
                    className={classes.input}
                    aria-label="Weight"
                  />%
                </div>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="ghostButton ml-2 sm:mt-0"
                  aria-label="Remove entry"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {entries.length < 10 && (
            <button
              type="button"
              onClick={addEntry}
              className={classes.button}
              aria-label="Add entry"
            >
              Add Entry
            </button>
          )}

          {totalWeight() > 0 && (
            <div className="resultCard">
              <h3 className="title">Weighted Average Result</h3>
              <p className="subtitle">
                Weighted average: <strong>{average().toFixed(2)}</strong>
              </p>
              <p className="mt-2 subtitle">
                Total weight: {totalWeight()}{' '}
                {totalWeight() > 0 ? (
                  'out of ' + totalWeight() + '%'
                ) : (
                  ''
                )}
              </p>
            </div>
          )}

          {entries.length === 0 && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Enter values and weights above to calculate a weighted average.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}