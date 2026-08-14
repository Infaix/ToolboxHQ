"use client";

import { useState } from 'react';
import Link from 'next/link';

interface MathFormula {
  name: string;
  category: string;
  formula: string;
  description: string;
  variables: { name: string; meaning: string }[];
}

const mathFormulas = {
  algebra: [
    {
      name: 'Quadratic Formula',
      formula: 'x = (-b +- sqrt(b^2 - 4ac)) / (2a)',
      description: 'Solves quadratic equations of the form ax^2 + bx + c = 0',
      variables: [
        { name: 'a', meaning: 'Coefficient of x^2' },
        { name: 'b', meaning: 'Coefficient of x' },
        { name: 'c', meaning: 'Constant term' },
      ],
    },
    {
      name: 'Distance Formula',
      formula: 'd = sqrt((x2 - x1)^2 + (y2 - y1)^2)',
      description: 'Distance between two points in a coordinate plane',
      variables: [
        { name: 'x1', meaning: 'x-coordinate of point 1' },
        { name: 'y1', meaning: 'y-coordinate of point 1' },
        { name: 'x2', meaning: 'x-coordinate of point 2' },
        { name: 'y2', meaning: 'y-coordinate of point 2' },
      ],
    },
    {
      name: 'Midpoint Formula',
      formula: 'M = ((x1 + x2) / 2, (y1 + y2) / 2)',
      description: 'Midpoint between two points in a coordinate plane',
      variables: [
        { name: 'x1', meaning: 'x-coordinate of point 1' },
        { name: 'y1', meaning: 'y-coordinate of point 1' },
        { name: 'x2', meaning: 'x-coordinate of point 2' },
        { name: 'y2', meaning: 'y-coordinate of point 2' },
      ],
    },
  ],

  functions: [
    {
      name: 'Slope Formula',
      formula: 'm = (y2 - y1) / (x2 - x1)',
      description: 'Slope of the line through two points',
      variables: [
        { name: 'x1', meaning: 'x-coordinate of point 1' },
        { name: 'y1', meaning: 'y-coordinate of point 1' },
        { name: 'x2', meaning: 'x-coordinate of point 2' },
        { name: 'y2', meaning: 'y-coordinate of point 2' },
      ],
    },
    {
      name: 'Point-Slope Form',
      formula: 'y - y1 = m(x - x1)',
      description: 'Line equation through point (x1, y1) with slope m',
      variables: [
        { name: 'm', meaning: 'slope' },
        { name: 'x1', meaning: 'x-coordinate' },
        { name: 'y1', meaning: 'y-coordinate' },
      ],
    },
  ],

  trigonometry: [
    {
      name: 'Pythagorean Theorem',
      formula: 'a^2 + b^2 = c^2',
      description: 'Relates the sides of a right triangle',
      variables: [
        { name: 'a', meaning: 'length of one leg' },
        { name: 'b', meaning: 'length of other leg' },
        { name: 'c', meaning: 'length of hypotenuse' },
      ],
    },
    {
      name: 'Sine',
      formula: 'sin(theta) = opposite / hypotenuse',
      description: 'Sine ratio for angle theta in a right triangle',
      variables: [
        { name: 'theta', meaning: 'angle measure' },
        { name: 'opposite', meaning: 'side opposite theta' },
        { name: 'hypotenuse', meaning: 'longest side of triangle' },
      ],
    },
    {
      name: 'Cosine',
      formula: 'cos(theta) = adjacent / hypotenuse',
      description: 'Cosine ratio for angle theta in a right triangle',
      variables: [
        { name: 'theta', meaning: 'angle measure' },
        { name: 'adjacent', meaning: 'side adjacent to theta' },
        { name: 'hypotenuse', meaning: 'longest side of triangle' },
      ],
    },
  ],

  calculus: [
    {
      name: 'Power Rule',
      formula: 'd/dx x^n = n * x^(n-1)',
      description: 'Derivative rule for power functions',
      variables: [
        { name: 'n', meaning: 'exponent' },
      ],
    },
    {
      name: 'Product Rule',
      formula: 'd/dx[f(x)g(x)] = f(x)g\'(x) + f\'(x)g(x)',
      description: 'Derivative of product of two functions',
      variables: [
        { name: 'f(x)', meaning: 'first function' },
        { name: 'g(x)', meaning: 'second function' },
      ],
    },
  ],

  statistics: [
    {
      name: 'Mean (Average)',
      formula: 'x_bar = (sum x_i) / n',
      description: 'Arithmetic mean of n values',
      variables: [
        { name: 'x_i', meaning: 'i-th value' },
        { name: 'n', meaning: 'number of values' },
      ],
    },
    {
      name: 'Standard Deviation',
      formula: 's = sqrt((sum(x_i - x_bar)^2) / (n - 1))',
      description: 'Measure of data spread',
      variables: [
        { name: 'x_i', meaning: 'i-th value' },
        { name: 'x_bar', meaning: 'mean' },
        { name: 'n', meaning: 'number of values' },
      ],
    },
  ],
};

export function useMathsFormulas() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof mathFormulas>('algebra');
  const visibleFormulas = mathFormulas[selectedCategory] || mathFormulas.algebra;

  return {
    selectedCategory,
    setSelectedCategory,
    visibleFormulas,
  };
}

export default function MathsFormulasPage() {
  const { selectedCategory, setSelectedCategory, visibleFormulas } = useMathsFormulas();
  const isDark = true; // simplified for this build

  const classes = {
    card: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-base text-gray-600 dark:text-gray-400',
    categoryBtn: 'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
    formula: 'my-4 font-medium text-gray-900 dark:text-white',
    description: 'text-sm text-gray-600 dark:text-gray-400',
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
            Maths Formula Reference
          </h1>
        </nav>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Formulas by Topic
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedCategory('algebra')}
              className={selectedCategory === 'algebra' ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white' : classes.categoryBtn}
            >
              Algebra
            </button>
            <button
              onClick={() => setSelectedCategory('functions')}
              className={selectedCategory === 'functions' ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white' : classes.categoryBtn}
            >
              Functions
            </button>
            <button
              onClick={() => setSelectedCategory('trigonometry')}
              className={selectedCategory === 'trigonometry' ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white' : classes.categoryBtn}
            >
              Trigonometry
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedCategory('calculus')}
              className={selectedCategory === 'calculus' ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white' : classes.categoryBtn}
            >
              Calculus
            </button>
            <button
              onClick={() => setSelectedCategory('statistics')}
              className={selectedCategory === 'statistics' ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white' : classes.categoryBtn}
            >
              Statistics
            </button>
          </div>
        </div>

        <div className="prose dark:prose-invert">
          {visibleFormulas.map((formula) => (
            <div key={formula.name} className="my-4">
              <h3 className="formula">{formula.formula}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formula.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formula.variables
                  .map((v) => `${v.name}: ${v.meaning}`)
                  .join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}