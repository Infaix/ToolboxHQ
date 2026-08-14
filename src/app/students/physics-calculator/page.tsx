"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface PhysicsCalculation {
  name: string;
  formula: string;
  inputs: { name: string; unit: string; defaultValue?: string }[];
  resultUnit: string;
}

export function usePhysicsCalculator() {
  const calculations: PhysicsCalculation[] = [
    {
      name: 'Speed',
      formula: 'speed = distance / time',
      inputs: [
        { name: 'distance', unit: 'm' },
        { name: 'time', unit: 's' },
      ],
      resultUnit: 'm/s',
    },
    {
      name: 'Acceleration',
      formula: 'acceleration = (final velocity - initial velocity) / time',
      inputs: [
        { name: 'initial velocity', unit: 'm/s' },
        { name: 'final velocity', unit: 'm/s' },
        { name: 'time', unit: 's' },
      ],
      resultUnit: 'm/s²',
    },
    {
      name: 'Force',
      formula: 'force = mass × acceleration',
      inputs: [
        { name: 'mass', unit: 'kg' },
        { name: 'acceleration', unit: 'm/s²' },
      ],
      resultUnit: 'N',
    },
    {
      name: 'Weight',
      formula: 'weight = mass × gravity',
      inputs: [
        { name: 'mass', unit: 'kg' },
        { name: 'gravity', unit: 'm/s²', defaultValue: '9.8' },
      ],
      resultUnit: 'N',
    },
    {
      name: 'Momentum',
      formula: 'momentum = mass × velocity',
      inputs: [
        { name: 'mass', unit: 'kg' },
        { name: 'velocity', unit: 'm/s' },
      ],
      resultUnit: 'kg⋅m/s',
    },
    {
      name: 'Kinetic Energy',
      formula: 'kinetic energy = 0.5 × mass × velocity²',
      inputs: [
        { name: 'mass', unit: 'kg' },
        { name: 'velocity', unit: 'm/s' },
      ],
      resultUnit: 'J',
    },
    {
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
      name: 'Work',
      formula: 'work = force × distance',
      inputs: [
        { name: 'force', unit: 'N' },
        { name: 'distance', unit: 'm' },
      ],
      resultUnit: 'J',
    },
    {
      name: 'Power',
      formula: 'power = work / time',
      inputs: [
        { name: 'work', unit: 'J' },
        { name: 'time', unit: 's' },
      ],
      resultUnit: 'W',
    },
    {
      name: 'Ohm\'s Law',
      formula: 'voltage = current × resistance',
      inputs: [
        { name: 'current', unit: 'A' },
        { name: 'resistance', unit: 'Ω' },
      ],
      resultUnit: 'V',
    },
    {
      name: 'Electrical Power',
      formula: 'power = voltage × current',
      inputs: [
        { name: 'voltage', unit: 'V' },
        { name: 'current', unit: 'A' },
      ],
      resultUnit: 'W',
    },
    {
      name: 'Wave Speed',
      formula: 'wave speed = frequency × wavelength',
      inputs: [
        { name: 'frequency', unit: 'Hz' },
        { name: 'wavelength', unit: 'm' },
      ],
      resultUnit: 'm/s',
    },
  ];

  const [calculation, setCalculation] = useState(calculations[0]);
  const [inputs, setInputs] = useState(() => {
    return calculation.inputs.reduce((acc, input) => {
      acc[input.name] = input.defaultValue !== undefined ? String(input.defaultValue) : '';
      return acc;
    }, {} as Record<string, string>);
  });

  const calculate = useCallback((): number => {
    let result = 0;
    try {
      if (calculation.name === 'Speed') {
        const distance = parseFloat(inputs.distance) || 0;
        const time = parseFloat(inputs.time) || 1;
        result = distance / time;
      } else if (calculation.name === 'Force') {
        const mass = parseFloat(inputs.mass) || 0;
        const acceleration = parseFloat(inputs.acceleration) || 0;
        result = mass * acceleration;
      } else if (calculation.name === 'Weight') {
        const mass = parseFloat(inputs.mass) || 0;
        const gravity = parseFloat(inputs.gravity) || 9.8;
        result = mass * gravity;
      } else if (calculation.name === 'Momentum') {
        const mass = parseFloat(inputs.mass) || 0;
        const velocity = parseFloat(inputs.velocity) || 0;
        result = mass * velocity;
      } else if (calculation.name === 'Kinetic Energy') {
        const mass = parseFloat(inputs.mass) || 0;
        const velocity = parseFloat(inputs.velocity) || 0;
        result = 0.5 * mass * velocity * velocity;
      } else if (calculation.name === 'Gravitational Potential Energy') {
        const mass = parseFloat(inputs.mass) || 0;
        const height = parseFloat(inputs.height) || 0;
        const gravity = parseFloat(inputs.gravity) || 9.8;
        result = mass * gravity * height;
      } else if (calculation.name === 'Work') {
        const force = parseFloat(inputs.force) || 0;
        const distance = parseFloat(inputs.distance) || 0;
        result = force * distance;
      } else if (calculation.name === 'Power') {
        const work = parseFloat(inputs.work) || 0;
        const time = parseFloat(inputs.time) || 1;
        result = work / time;
      } else if (calculation.name === 'Ohm\'s Law') {
        const current = parseFloat(inputs.current) || 0;
        const resistance = parseFloat(inputs.resistance) || 0;
        result = current * resistance;
      } else if (calculation.name === 'Electrical Power') {
        const voltage = parseFloat(inputs.voltage) || 0;
        const current = parseFloat(inputs.current) || 0;
        result = voltage * current;
      } else if (calculation.name === 'Wave Speed') {
        const frequency = parseFloat(inputs.frequency) || 0;
        const wavelength = parseFloat(inputs.wavelength) || 0;
        result = frequency * wavelength;
      } else {
        result = 0;
      }
    } catch (e) {
      // Handle error silently
    }
    return result;
  }, [calculation, inputs]);

  const handleInputChange = useCallback((name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  }, []);

  return {
    calculations,
    calculation,
    setCalculation,
    inputs,
    setInputs,
    handleInputChange,
    calculate,
  };
}

export default function PhysicsCalculatorPage() {
  const { calculations, calculation, setCalculation, inputs, setInputs, handleInputChange, calculate } = usePhysicsCalculator();
  const isDark = true; // simplified for this build

  const classes = {
    card: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-base text-gray-600 dark:text-gray-400',
    resultCard: 'mt-6 rounded-xl border p-6 bg-gray-50 dark:bg-gray-800',
    input: 'w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    row: 'flex flex-col sm:flex-row gap-4',
    inputGroup: 'flex-1',
    button: 'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
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
            Physics Calculator
          </h1>
        </nav>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Select Calculation
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {calculations.map((calc) => (
              <div
                key={calc.name}
                className="group cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setCalculation(calc)}
              >
                <div className="p-4 rounded-xl border border-gray-200 bg-white transition-colors dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <h3 className="font-medium text-gray-900 dark:text-white">{calc.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{calc.formula}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {calculation.name && (
          <div className="resultCard">
            <h3 className="title">{calculation.name}</h3>
            <p className="subtitle">{calculation.formula}</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {calculation.inputs.map((input) => (
                <div key={input.name} className="mb-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {input.name}
                  </label>
                  <input
                    type="number"
                    value={inputs[input.name] ?? ''}
                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                    className={classes.input}
                    aria-label={input.name}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{input.unit}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={calculate}
              className={classes.button}
              aria-label="Calculate result"
            >
              Calculate
            </button>
            <p className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
              Result: {calculate()} {calculation.resultUnit}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}