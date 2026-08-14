"use client";

import { useState, useCallback } from 'react';

interface ScientificCalcState {
  display: string;
  history: string[];
  memory: number;
}

export function useScientificCalculator() {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<string[]>([]);
  const [memory, setMemory] = useState(0);

  const allowedKeys = /[0-9/*+\\-=().%]/;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!allowedKeys.test(event.key)) {
      event.preventDefault();
    }
  }, [allowedKeys]);

  const appendToDisplay = useCallback((value: string) => {
    const prev = display;
    setDisplay(prevValue => {
      if (prev === '0' && allowedKeys.test(value) && value !== '.') return value;
      if (prev === '.' && value === '.') return prev;
      return prev === '0' && allowedKeys.test(value) ? value : prev + value;
    });
  }, [allowedKeys]);

  const calculate = useCallback(() => {
    try {
      const expression = display.replace(/×/g, '*').replace(/÷/g, '/');
      const result = new Function('return ' + expression)();
      setDisplay(isFinite(result) ? String(result) : 'Error');
      setHistory(prev => [...prev, `${display} = ${String(result)}`]);
    } catch (e) {
      setDisplay('Error');
    }
  }, []);

  const clearDisplay = useCallback(() => setDisplay('0'), []);

  const deleteLast = useCallback(() => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  }, []);

  const memoryAdd = useCallback(() => {
    setMemory(prev => prev + (parseFloat(display) || 0));
  }, [display]);

  const memoryRecall = useCallback(() => {
    setDisplay(String(memory));
  }, [memory]);

  const memoryClear = useCallback(() => setMemory(0), []);

  return {
    display,
    setDisplay,
    history,
    memory,
    appendToDisplay,
    calculate,
    clearDisplay,
    deleteLast,
    memoryAdd,
    memoryRecall,
    memoryClear,
  };
}

export default function ScientificCalculatorPage() {
  const { display, setDisplay, history, memory, appendToDisplay, calculate, clearDisplay, deleteLast, memoryAdd, memoryRecall, memoryClear } = useScientificCalculator();
  const isDark = true; // simplified for this build

  const classes = {
    display: 'w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    row: 'flex items-center gap-2',
    cell: 'flex-1 min-w-0',
    button: 'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700',
    ghostButton: 'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    card: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-base text-gray-600 dark:text-gray-400',
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
            Scientific Calculator
          </h1>
        </nav>

        <div className="mb-8">
          <div className="card">
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Calculator</h3>
              <p className="text-lg text-gray-600">
                {display}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => appendToDisplay('1')}
            className={classes.button}
          >
            1
          </button>
          <button
            type="button"
            onClick={() => appendToDisplay('2')}
            className={classes.button}
          >
            2
          </button>
          <button
            type="button"
            onClick={() => appendToDisplay('3')}
            className={classes.button}
          >
            3
          </button>
          <button
            type="button"
            onClick={() => appendToDisplay('/')}
            className={classes.button}
          >
            /
          </button>
          <button
            type="button"
            onClick={() => appendToDisplay('4')}
            className={classes.button}
          >
            4
          </button>
          <button
            type="button"
            onClick={() => appendToDisplay('5')}
            className={classes.button}
          >
            5
          </button>
          <button
            type="button"
            onClick={() => appendToDisplay('6')}
            className={classes.button}
          >
            6
          </button>
          <button
            type="button"
            onClick={() => appendToDisplay('*')}
            className={classes.button}
          >
            *
          </button>
          <button
            type="button"
            onClick={() => appendToDisplay('7')}
            className={classes.button}
          >
            7
          </button>
          <button
            type="button"
            onClick={() => appendToDisplay('8')}
            className={classes.button}
          >
            8
          </button>
          <button
            type="button"
            onClick={() => appendToDisplay('9')}
            className={classes.button}
          >
            9
          </button>
          <button
            type="button"
            onClick={() => appendToDisplay('-')}
            className={classes.button}
          >
            -
          </button>
          <button
            type="button"
            onClick={() => appendToDisplay('0')}
            className={classes.button}
          >
            0
          </button>
          <button
            type="button"
            onClick={() => clearDisplay()}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded text-sm"
          >
            AC
          </button>
          <button
            type="button"
            onClick={() => deleteLast()}
            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded text-sm"
          >
            DEL
          </button>
          <button
            type="button"
            onClick={() => appendToDisplay('.')}
            className={classes.button}
          >
            .
          </button>
          <button
            type="button"
            onClick={() => calculate()}
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded text-sm"
          >
            =
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-semibold mb-2">Memory</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => memoryAdd()}
              className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-2 py-1 rounded text-sm"
            >
              M+
            </button>
            <button
              type="button"
              onClick={() => memoryRecall()}
              className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-2 py-1 rounded text-sm"
            >
              MR
            </button>
            <button
              type="button"
              onClick={() => memoryClear()}
              className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-2 py-1 rounded text-sm"
            >
              MC
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-semibold mb-2">History</h3>
          <div className="h-32 overflow-y-auto space-y-1">
            {history.map((entry, index) => (
              <p key={index} className="text-sm text-gray-500 dark:text-gray-400">
                {entry}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}