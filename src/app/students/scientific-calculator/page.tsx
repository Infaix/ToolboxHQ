"use client";

import { useState, useCallback } from 'react';

export function useScientificCalculator() {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState<string[]>([]);
  const [showMemory, setShowMemory] = useState(false);
  const memory = useState(0)[1];

  const allowedKeys = /[0-9/*+\\-=().%]/;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!allowedKeys.test(event.key)) {
      event.preventDefault();
    }
  }, []);

  const appendToDisplay = useCallback((value: string) => {
    const last = display;
    setDisplay(prev => {
      if (prev === '0' && allowedKeys.test(value) && value !== '.') return value;
      if (prev === '.' && value === '.') return prev;
      return prev === '0' && allowedKeys.test(value) ? value : prev + value;
    });
  }, []);

  const calculate = useCallback(() => {
    try {
      const expression = display.replace(/×/g, '*').replace(/÷/g, '/');
      const result = new Function('return ' + expression)();
      setDisplay(isFinite(result) ? result : 'Error');
      setHistory(prev => [...prev, `${display} = ${result}`]);
    } catch (e) {
      setDisplay('Error');
    }
  }, []);

  const clearDisplay = useCallback(() => setDisplay('0'), []);
  const deleteLast = useCallback(() => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  }, []);

  const memoryAdd = useCallback(() => {
    setMemory(prev => prev + parseFloat(display) || 0);
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
    handleKeyDown,
  };
}

export default function ScientificCalculatorPage() {
  const { display, setDisplay, history, memory, appendToDisplay, calculate, clearDisplay, deleteLast, memoryAdd, memoryRecall, memoryClear, handleKeyDown } = useScientificCalculator();

  const classes = {
    display: 'w-full rounded-md border border-gray-300 bg-white p-4 text-3xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    button: 'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
    span: 'flex-1',
    operator: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100',
    span2: 'flex-1/2',
  };

  const keys = [
    ['MC', 'MR', 'M+', 'C'],
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['π', '0', '=', '+'],
    ['√', '(', ')', '%'],
  ];

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
    handleKeyDown,
    keys,
  };
}