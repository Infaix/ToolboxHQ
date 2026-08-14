"use client";

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface PhysicsInput {
  name: string;
  unit: string;
  defaultValue?: string;
}

interface PhysicsCalculation {
  slug: string;
  name: string;
  formula: string;
  inputs: PhysicsInput[];
  resultUnit: string;
}

interface PhysicsCalcState {
  result: number | null;
}

const CALCULATIONS: PhysicsCalculation[] = [
  {
    slug: 'speed',
    name: 'Speed',
    formula: 'speed = distance / time',
    inputs: [
      { name: 'distance', unit: 'm' },
      { name: 'time', unit: 's' },
    ],
    resultUnit: 'm/s',
  },
  {
    slug: 'acceleration',
    name: 'Acceleration',
    formula: 'acceleration = (final velocity − initial velocity) / time',
    inputs: [
      { name: 'initial velocity', unit: 'm/s' },
      { name: 'final velocity', unit: 'm/s' },
      { name: 'time', unit: 's' },
    ],
    resultUnit: 'm/s²',
  },
  {
    slug: 'force',
    name: 'Force',
    formula: 'force = mass × acceleration',
    inputs: [
      { name: 'mass', unit: 'kg' },
      { name: 'acceleration', unit: 'm/s²' },
    ],
    resultUnit: 'N',
  },
  {
    slug: 'weight',
    name: 'Weight',
    formula: 'weight = mass × gravity',
    inputs: [
      { name: 'mass', unit: 'kg' },
      { name: 'gravity', unit: 'm/s²', defaultValue: '9.8' },
    ],
    resultUnit: 'N',
  },
  {
    slug: 'momentum',
    name: 'Momentum',
    formula: 'momentum = mass × velocity',
    inputs: [
      { name: 'mass', unit: 'kg' },
      { name: 'velocity', unit: 'm/s' },
    ],
    resultUnit: 'kg·m/s',
  },
  {
    slug: 'kinetic-energy',
    name: 'Kinetic Energy',
    formula: 'kinetic energy = 0.5 × mass × velocity²',
    inputs: [
      { name: 'mass', unit: 'kg' },
      { name: 'velocity', unit: 'm/s' },
    ],
    resultUnit: 'J',
  },
  {
    slug: 'gpe',
    name: 'Gravitational Potential Energy',
    formula: 'GPE = mass × gravity × height',
    inputs: [
      { name: 'mass', unit: 'kg' },
      { name: 'height', unit: 'm' },
      { name: 'gravity', unit: 'm/s²', defaultValue: '9.8' },
    ],
    resultUnit: 'J',
  },
  {
    slug: 'work',
    name: 'Work',
    formula: 'work = force × distance',
    inputs: [
      { name: 'force', unit: 'N' },
      { name: 'distance', unit: 'm' },
    ],
    resultUnit: 'J',
  },
  {
    slug: 'power',
    name: 'Power',
    formula: 'power = work / time',
    inputs: [
      { name: 'work', unit: 'J' },
      { name: 'time', unit: 's' },
    ],
    resultUnit: 'W',
  },
  {
    slug: 'ohms-law',
    name: 'Ohm\u2019s Law',
    formula: 'voltage = current × resistance',
    inputs: [
      { name: 'current', unit: 'A' },
      { name: 'resistance', unit: 'Ω' },
    ],
    resultUnit: 'V',
  },
  {
    slug: 'electrical-power',
    name: 'Electrical Power',
    formula: 'power = voltage × current',
    inputs: [
      { name: 'voltage', unit: 'V' },
      { name: 'current', unit: 'A' },
    ],
    resultUnit: 'W',
  },
  {
    slug: 'wave-speed',
    name: 'Wave Speed',
    formula: 'wave speed = frequency × wavelength',
    inputs: [
      { name: 'frequency', unit: 'Hz' },
      { name: 'wavelength', unit: 'm' },
    ],
    resultUnit: 'm/s',
  },
];

function initialInputs(calculation: PhysicsCalculation): Record<string, string> {
  return calculation.inputs.reduce<Record<string, string>>((acc, input) => {
    acc[input.name] = input.defaultValue !== undefined ? input.defaultValue : '';
    return acc;
  }, {});
}

function findCalculation(slug: string | null): PhysicsCalculation {
  if (slug) {
    const match = CALCULATIONS.find((c) => c.slug === slug);
    if (match) return match;
  }
  return CALCULATIONS[0];
}

export function usePhysicsCalculator() {
  const [calculation, setCalculation] = useState<PhysicsCalculation>(() => {
    if (typeof window === 'undefined') return CALCULATIONS[0];
    const params = new URLSearchParams(window.location.search);
    return findCalculation(params.get('formula'));
  });
  const [inputs, setInputs] = useState<Record<string, string>>(() => initialInputs(calculation));
  const [state, setState] = useState<PhysicsCalcState>({ result: null });

  const selectCalculation = useCallback((next: PhysicsCalculation) => {
    setCalculation(next);
    setInputs(initialInputs(next));
    setState({ result: null });
  }, []);

  const calculate = useCallback((): number => {
    const get = (key: string): number => {
      const value = parseFloat(inputs[key]);
      return Number.isFinite(value) ? value : 0;
    };

    switch (calculation.slug) {
      case 'speed': {
        const distance = get('distance');
        const time = get('time');
        return time === 0 ? 0 : distance / time;
      }
      case 'acceleration': {
        const u = get('initial velocity');
        const v = get('final velocity');
        const t = get('time');
        return t === 0 ? 0 : (v - u) / t;
      }
      case 'force':
        return get('mass') * get('acceleration');
      case 'weight':
        return get('mass') * (get('gravity') || 9.8);
      case 'momentum':
        return get('mass') * get('velocity');
      case 'kinetic-energy': {
        const v = get('velocity');
        return 0.5 * get('mass') * v * v;
      }
      case 'gpe':
        return get('mass') * (get('gravity') || 9.8) * get('height');
      case 'work':
        return get('force') * get('distance');
      case 'power': {
        const time = get('time');
        return time === 0 ? 0 : get('work') / time;
      }
      case 'ohms-law':
        return get('current') * get('resistance');
      case 'electrical-power':
        return get('voltage') * get('current');
      case 'wave-speed':
        return get('frequency') * get('wavelength');
      default:
        return 0;
    }
  }, [calculation, inputs]);

  const handleCalculate = useCallback(() => {
    setState({ result: calculate() });
  }, [calculate]);

  const handleInputChange = useCallback((name: string, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
    setState((prev) => ({ ...prev, result: null }));
  }, []);

  return {
    calculations: CALCULATIONS,
    calculation,
    selectCalculation,
    inputs,
    handleInputChange,
    handleCalculate,
    result: state.result,
  };
}

export default function PhysicsCalculatorPage() {
  const {
    calculations,
    calculation,
    selectCalculation,
    inputs,
    handleInputChange,
    handleCalculate,
    result,
  } = usePhysicsCalculator();

  const classes = {
    card: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    input:
      'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    button:
      'inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
              Physics Calculator
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Solve common physics formulas — inputs are generated from each formula&apos;s variables.
            </p>
          </div>
        </nav>

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Select a Formula</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {calculations.map((calc) => {
              const active = calc.slug === calculation.slug;
              return (
                <button
                  key={calc.slug}
                  type="button"
                  onClick={() => selectCalculation(calc)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    active
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950'
                      : 'border-gray-200 bg-white hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400'
                  }`}
                  aria-pressed={active}
                >
                  <h3 className={`text-sm font-semibold ${active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                    {calc.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{calc.formula}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className={classes.card}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{calculation.name}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{calculation.formula}</p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              Result: {calculation.resultUnit}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {calculation.inputs.map((input) => (
              <div key={input.name}>
                <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                  {input.name}
                  <span className="ml-1 font-normal text-gray-400">({input.unit})</span>
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={inputs[input.name] ?? ''}
                  onChange={(e) => handleInputChange(input.name, e.target.value)}
                  placeholder={input.defaultValue ?? '0'}
                  className={classes.input}
                  aria-label={input.name}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={handleCalculate} className={classes.button} aria-label="Calculate result">
              Calculate
            </button>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Result</p>
              <p className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
                {result === null ? '—' : `${result.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${calculation.resultUnit}`}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          This calculator uses idealised formulas and assumes values are in the units shown. Results are for study
          practice, not official measurements.
        </p>
      </div>
    </div>
  );
}
