"use client";

import { useState } from 'react';
import Link from 'next/link';

interface PhysicsFormula {
  name: string;
  category: string;
  formula: string;
  description: string;
  variables: { name: string; meaning: string; unit: string }[];
}

const physicsFormulas = {
  mechanics: [
    {
      name: 'Speed',
      formula: 'v = d / t',
      description: 'Speed is distance divided by time',
      variables: [
        { name: 'v', meaning: 'speed', unit: 'm/s' },
        { name: 'd', meaning: 'distance', unit: 'm' },
        { name: 't', meaning: 'time', unit: 's' },
      ],
    },
    {
      name: 'Acceleration',
      formula: 'a = (v - u) / t',
      description: 'Acceleration is change in velocity divided by time',
      variables: [
        { name: 'a', meaning: 'acceleration', unit: 'm/s²' },
        { name: 'u', meaning: 'initial velocity', unit: 'm/s' },
        { name: 'v', meaning: 'final velocity', unit: 'm/s' },
        { name: 't', meaning: 'time', unit: 's' },
      ],
    },
    {
      name: 'Force',
      formula: 'F = m × a',
      description: 'Force is mass times acceleration (Newton\'s Second Law)',
      variables: [
        { name: 'F', meaning: 'force', unit: 'N' },
        { name: 'm', meaning: 'mass', unit: 'kg' },
        { name: 'a', meaning: 'acceleration', unit: 'm/s²' },
      ],
    },
    {
      name: 'Weight',
      formula: 'W = m × g',
      description: 'Weight is mass times gravitational acceleration',
      variables: [
        { name: 'W', meaning: 'weight', unit: 'N' },
        { name: 'm', meaning: 'mass', unit: 'kg' },
        { name: 'g', meaning: 'gravitational acceleration', unit: 'm/s²', defaultValue: 9.8 },
      ],
    },
    {
      name: 'Momentum',
      formula: 'p = m × v',
      description: 'Momentum is mass times velocity',
      variables: [
        { name: 'p', meaning: 'momentum', unit: 'kg⋅m/s' },
        { name: 'm', meaning: 'mass', unit: 'kg' },
        { name: 'v', meaning: 'velocity', unit: 'm/s' },
      ],
    },
    {
      name: 'Kinetic Energy',
      formula: 'KE = 0.5 × m × v²',
      description: 'Kinetic energy is half mass times velocity squared',
      variables: [
        { name: 'KE', meaning: 'kinetic energy', unit: 'J' },
        { name: 'm', meaning: 'mass', unit: 'kg' },
        { name: 'v', meaning: 'velocity', unit: 'm/s' },
      ],
    },
    {
      name: 'Gravitational Potential Energy',
      formula: 'GPE = m × g × h',
      description: 'Gravitational potential energy is mass times gravity times height',
      variables: [
        { name: 'GPE', meaning: ' gravitational potential energy', unit: 'J' },
        { name: 'm', meaning: 'mass', unit: 'kg' },
        { name: 'g', meaning: 'gravitational acceleration', unit: 'm/s²', defaultValue: 9.8 },
        { name: 'h', meaning: 'height', unit: 'm' },
      ],
    },
  ],
  
  energy: [
    {
      name: 'Work',
      formula: 'W = F × d',
      description: 'Work is force times distance',
      variables: [
        { name: 'W', meaning: 'work', unit: 'J' },
        { name: 'F', meaning: 'force', unit: 'N' },
        { name: 'd', meaning: 'distance', unit: 'm' },
      ],
    },
    {
      name: 'Power',
      formula: 'P = W / t',
      description: 'Power is work divided by time',
      variables: [
        { name: 'P', meaning: 'power', unit: 'W' },
        { name: 'W', meaning: 'work', unit: 'J' },
        { name: 't', meaning: 'time', unit: 's' },
      ],
    },
    {
      name: 'Ohm\'s Law',
      formula: 'V = I × R',
      description: 'Ohm\'s Law relates voltage, current and resistance',
      variables: [
        { name: 'V', meaning: 'voltage', unit: 'V' },
        { name: 'I', meaning: 'current', unit: 'A' },
        { name: 'R', meaning: 'resistance', unit: 'Ω' },
      ],
    },
    {
      name: 'Electrical Power',
      formula: 'P = V × I',
      description: 'Electrical power is voltage times current',
      variables: [
        { name: 'P', meaning: 'power', unit: 'W' },
        { name: 'V', meaning: 'voltage', unit: 'V' },
        { name: 'I', meaning: 'current', unit: 'A' },
      ],
    },
  ],
  
  waves: [
    {
      name: 'Wave Speed',
      formula: 'v = f × λ',
      description: 'Wave speed is frequency times wavelength',
      variables: [
        { name: 'v', meaning: 'wave speed', unit: 'm/s' },
        { name: 'f', meaning: 'frequency', unit: 'Hz' },
        { name: 'λ', meaning: 'wavelength', unit: 'm' },
      ],
    },
  ],
};

export function usePhysicsFormulas() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof physicsFormulas>('mechanics');
  const visibleFormulas = physicsFormulas[selectedCategory] || physicsFormulas.mechanics;

  return {
    selectedCategory,
    setSelectedCategory,
    visibleFormulas,
  };
}

export default function PhysicsFormulasPage() {
  const { selectedCategory, setSelectedCategory, visibleFormulas } = usePhysicsFormulas();
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
            Physics Formula Reference
          </h1>
        </nav>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Formulas by Topic
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedCategory('mechanics')}
              className={selectedCategory === 'mechanics' ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white' : classes.categoryBtn}
            >
              Mechanics
            </button>
            <button
              onClick={() => setSelectedCategory('energy')}
              className={selectedCategory === 'energy' ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white' : classes.categoryBtn}
            >
              Energy
            </button>
            <button
              onClick={() => setSelectedCategory('waves')}
              className={selectedCategory === 'waves' ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-white' : classes.categoryBtn}
            >
              Waves
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
                  .map((v) => `${v.name} (${v.unit})`)
                  .join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}