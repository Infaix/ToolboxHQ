"use client";

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';

type Category = 'length' | 'mass' | 'time' | 'area' | 'volume' | 'temperature' | 'speed' | 'pressure' | 'energy';

const CATEGORY_KEYS: Category[] = [
  'length',
  'mass',
  'time',
  'area',
  'volume',
  'temperature',
  'speed',
  'pressure',
  'energy',
];

const CATEGORY_LABELS: Record<Category, string> = {
  length: 'Length',
  mass: 'Mass',
  time: 'Time',
  area: 'Area',
  volume: 'Volume',
  temperature: 'Temperature',
  speed: 'Speed',
  pressure: 'Pressure',
  energy: 'Energy',
};

// Multiplicative factors relative to a base unit for each linear category.
const LINEAR_FACTORS: Record<Exclude<Category, 'temperature'>, Record<string, number>> = {
  length: {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.34,
  },
  mass: {
    mg: 0.000001,
    g: 0.001,
    kg: 1,
    ton: 1000,
    oz: 0.0283495,
    lb: 0.453592,
  },
  time: {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
  },
  area: {
    mm2: 0.000001,
    cm2: 0.0001,
    m2: 1,
    km2: 1000000,
    in2: 0.00064516,
    ft2: 0.092903,
    yd2: 0.836127,
  },
  volume: {
    ml: 0.001,
    l: 1,
    m3: 1000,
    tsp: 0.00492892,
    tbsp: 0.0147868,
    cup: 0.24,
    pt: 0.473176,
    gal: 3.78541,
  },
  speed: {
    mps: 1,
    kmh: 3.6,
    mph: 0.44704,
    kts: 0.514444,
  },
  pressure: {
    pa: 1,
    kpa: 1000,
    MPa: 1000000,
    psi: 6894.76,
    atm: 101325,
  },
  energy: {
    j: 1,
    kJ: 1000,
    cal: 4.184,
    kcal: 4184,
    BTU: 1055.06,
  },
};

const TEMPERATURE_UNITS: { code: string; label: string }[] = [
  { code: 'c', label: 'Celsius (°C)' },
  { code: 'f', label: 'Fahrenheit (°F)' },
  { code: 'k', label: 'Kelvin (K)' },
];

const UNIT_LABELS: Record<string, string> = {
  m: 'Meters (m)',
  km: 'Kilometers (km)',
  cm: 'Centimeters (cm)',
  mm: 'Millimeters (mm)',
  in: 'Inches (in)',
  ft: 'Feet (ft)',
  yd: 'Yards (yd)',
  mi: 'Miles (mi)',
  kg: 'Kilograms (kg)',
  g: 'Grams (g)',
  mg: 'Milligrams (mg)',
  ton: 'Tonnes (t)',
  oz: 'Ounces (oz)',
  lb: 'Pounds (lb)',
  s: 'Seconds (s)',
  min: 'Minutes (min)',
  h: 'Hours (h)',
  d: 'Days (d)',
  mm2: 'Square mm (mm²)',
  cm2: 'Square cm (cm²)',
  m2: 'Square m (m²)',
  km2: 'Square km (km²)',
  in2: 'Square in (in²)',
  ft2: 'Square ft (ft²)',
  yd2: 'Square yd (yd²)',
  ml: 'Milliliters (mL)',
  l: 'Liters (L)',
  m3: 'Cubic meters (m³)',
  tsp: 'Teaspoons',
  tbsp: 'Tablespoons',
  cup: 'Cups',
  pt: 'Pints (pt)',
  gal: 'Gallons (gal)',
  mps: 'Meters/sec (m/s)',
  kmh: 'Km/hour (km/h)',
  mph: 'Miles/hour (mph)',
  kts: 'Knots',
  pa: 'Pascals (Pa)',
  kpa: 'Kilopascals (kPa)',
  MPa: 'Megapascals (MPa)',
  psi: 'Pounds/sq inch (psi)',
  atm: 'Atmospheres (atm)',
  j: 'Joules (J)',
  kJ: 'Kilojoules (kJ)',
  cal: 'Calories (cal)',
  kcal: 'Kilocalories (kcal)',
  BTU: 'British thermal units (BTU)',
};

function toCelsius(value: number, unit: string): number {
  switch (unit) {
    case 'c':
      return value;
    case 'f':
      return ((value - 32) * 5) / 9;
    case 'k':
      return value - 273.15;
    default:
      return 0;
  }
}

function fromCelsius(celsius: number, unit: string): number {
  switch (unit) {
    case 'c':
      return celsius;
    case 'f':
      return (celsius * 9) / 5 + 32;
    case 'k':
      return celsius + 273.15;
    default:
      return 0;
  }
}

function getUnits(category: Category): string[] {
  if (category === 'temperature') return TEMPERATURE_UNITS.map((u) => u.code);
  return Object.keys(LINEAR_FACTORS[category]);
}

function convert(category: Category, value: number, from: string, to: string): number {
  if (category === 'temperature') {
    return fromCelsius(toCelsius(value, from), to);
  }
  const fromFactor = LINEAR_FACTORS[category][from];
  const toFactor = LINEAR_FACTORS[category][to];
  if (fromFactor === undefined || toFactor === undefined) return 0;
  return (value * fromFactor) / toFactor;
}

export function useUnitConverter() {
  const [category, setCategory] = useState<Category>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('m');
  const [value, setValue] = useState('1');

  const selectCategory = useCallback((next: Category) => {
    setCategory(next);
    const units = getUnits(next);
    setFromUnit(units[0]);
    setToUnit(units[1] ?? units[0]);
  }, []);

  const swapUnits = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }, [fromUnit, toUnit]);

  const convertedValue = useMemo(() => {
    const num = parseFloat(value);
    if (!Number.isFinite(num)) return 0;
    return convert(category, num, fromUnit, toUnit);
  }, [category, value, fromUnit, toUnit]);

  return {
    category,
    categories: CATEGORY_KEYS,
    categoryLabel: CATEGORY_LABELS[category],
    selectCategory,
    fromUnit,
    setFromUnit,
    toUnit,
    setToUnit,
    value,
    setValue,
    swapUnits,
    convertedValue,
    unitOptions: getUnits(category),
  };
}

export default function UnitConverterPage() {
  const {
    category,
    categories,
    categoryLabel,
    selectCategory,
    fromUnit,
    setFromUnit,
    toUnit,
    setToUnit,
    value,
    setValue,
    swapUnits,
    convertedValue,
    unitOptions,
  } = useUnitConverter();

  const inputClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white';
  const ghostButton =
    'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
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
              Unit Converter
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Convert between units across {categories.length} categories.
            </p>
          </div>
        </nav>

        <div className="mb-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => selectCategory(key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  category === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-pressed={category === key}
              >
                {CATEGORY_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Convert {categoryLabel}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="unit-value">
                Value
              </label>
              <input
                id="unit-value"
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={inputClass}
                aria-label="Value to convert"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="unit-from">
                From
              </label>
              <select
                id="unit-from"
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className={inputClass}
                aria-label="Convert from unit"
              >
                {unitOptions.map((code) => (
                  <option key={code} value={code}>
                    {UNIT_LABELS[code] ?? code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="unit-to">
                To
              </label>
              <select
                id="unit-to"
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className={inputClass}
                aria-label="Convert to unit"
              >
                {unitOptions.map((code) => (
                  <option key={code} value={code}>
                    {UNIT_LABELS[code] ?? code}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button type="button" onClick={swapUnits} className={ghostButton} aria-label="Swap units">
                ⇄ Swap units
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-5 text-center dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {value === '' ? '0' : value} {UNIT_LABELS[fromUnit] ?? fromUnit} equals
            </p>
            <p className="mt-1 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {convertedValue.toLocaleString(undefined, { maximumFractionDigits: 10 })}{' '}
              {UNIT_LABELS[toUnit] ?? toUnit}
            </p>
          </div>
        </div>

        <footer className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <p>All conversions run entirely in your browser. No data is sent anywhere.</p>
        </footer>
      </div>
    </div>
  );
}
