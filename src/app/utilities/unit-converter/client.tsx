'use client';

import { useMemo, useState } from 'react';
import ToolHeader from '@/components/tools/ToolHeader';
import ToolContainer from '@/components/tools/ToolContainer';
import CopyButton from '@/components/tools/CopyButton';
import RelatedTools from '@/components/tools/RelatedTools';

interface Unit {
  id: string;
  label: string;
  symbol: string;
  factor: number;
}

interface UnitCategory {
  id: string;
  label: string;
  icon: string;
  units: Unit[];
}

const CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    label: 'Length',
    icon: '📏',
    units: [
      { id: 'mm', label: 'Millimetre', symbol: 'mm', factor: 0.001 },
      { id: 'cm', label: 'Centimetre', symbol: 'cm', factor: 0.01 },
      { id: 'm', label: 'Metre', symbol: 'm', factor: 1 },
      { id: 'km', label: 'Kilometre', symbol: 'km', factor: 1000 },
      { id: 'in', label: 'Inch', symbol: 'in', factor: 0.0254 },
      { id: 'ft', label: 'Foot', symbol: 'ft', factor: 0.3048 },
      { id: 'yd', label: 'Yard', symbol: 'yd', factor: 0.9144 },
      { id: 'mi', label: 'Mile', symbol: 'mi', factor: 1609.344 },
      { id: 'nmi', label: 'Nautical mile', symbol: 'nmi', factor: 1852 },
    ],
  },
  {
    id: 'weight',
    label: 'Weight',
    icon: '⚖️',
    units: [
      { id: 'mg', label: 'Milligram', symbol: 'mg', factor: 0.000001 },
      { id: 'g', label: 'Gram', symbol: 'g', factor: 0.001 },
      { id: 'kg', label: 'Kilogram', symbol: 'kg', factor: 1 },
      { id: 't', label: 'Tonne', symbol: 't', factor: 1000 },
      { id: 'oz', label: 'Ounce', symbol: 'oz', factor: 0.028349523125 },
      { id: 'lb', label: 'Pound', symbol: 'lb', factor: 0.45359237 },
      { id: 'st', label: 'Stone', symbol: 'st', factor: 6.35029318 },
      { id: 'usTon', label: 'US ton', symbol: 'ton', factor: 907.18474 },
    ],
  },
  {
    id: 'temperature',
    label: 'Temperature',
    icon: '🌡️',
    units: [
      { id: 'c', label: 'Celsius', symbol: '°C', factor: 1 },
      { id: 'f', label: 'Fahrenheit', symbol: '°F', factor: 1 },
      { id: 'k', label: 'Kelvin', symbol: 'K', factor: 1 },
      { id: 'r', label: 'Rankine', symbol: '°R', factor: 1 },
      { id: 're', label: 'Réaumur', symbol: '°Ré', factor: 1 },
    ],
  },
  {
    id: 'area',
    label: 'Area',
    icon: '📐',
    units: [
      { id: 'mm2', label: 'Square millimetre', symbol: 'mm²', factor: 0.000001 },
      { id: 'cm2', label: 'Square centimetre', symbol: 'cm²', factor: 0.0001 },
      { id: 'm2', label: 'Square metre', symbol: 'm²', factor: 1 },
      { id: 'ha', label: 'Hectare', symbol: 'ha', factor: 10000 },
      { id: 'km2', label: 'Square kilometre', symbol: 'km²', factor: 1000000 },
      { id: 'in2', label: 'Square inch', symbol: 'in²', factor: 0.00064516 },
      { id: 'ft2', label: 'Square foot', symbol: 'ft²', factor: 0.09290304 },
      { id: 'yd2', label: 'Square yard', symbol: 'yd²', factor: 0.83612736 },
      { id: 'acre', label: 'Acre', symbol: 'ac', factor: 4046.8564224 },
      { id: 'mi2', label: 'Square mile', symbol: 'mi²', factor: 2589988.110336 },
    ],
  },
  {
    id: 'volume',
    label: 'Volume',
    icon: '🧪',
    units: [
      { id: 'ml', label: 'Millilitre', symbol: 'ml', factor: 0.001 },
      { id: 'l', label: 'Litre', symbol: 'l', factor: 1 },
      { id: 'm3', label: 'Cubic metre', symbol: 'm³', factor: 1000 },
      { id: 'tsp', label: 'Teaspoon (US)', symbol: 'tsp', factor: 0.00492892159375 },
      { id: 'tbsp', label: 'Tablespoon (US)', symbol: 'tbsp', factor: 0.01478676478125 },
      { id: 'floz', label: 'Fluid ounce (US)', symbol: 'fl oz', factor: 0.0295735295625 },
      { id: 'cup', label: 'Cup (US)', symbol: 'cup', factor: 0.2365882365 },
      { id: 'pt', label: 'Pint (US)', symbol: 'pt', factor: 0.473176473 },
      { id: 'qt', label: 'Quart (US)', symbol: 'qt', factor: 0.946352946 },
      { id: 'gal', label: 'Gallon (US)', symbol: 'gal', factor: 3.785411784 },
    ],
  },
  {
    id: 'speed',
    label: 'Speed',
    icon: '🚗',
    units: [
      { id: 'mps', label: 'Metres per second', symbol: 'm/s', factor: 1 },
      { id: 'kmh', label: 'Kilometres per hour', symbol: 'km/h', factor: 0.2777777777777778 },
      { id: 'mph', label: 'Miles per hour', symbol: 'mph', factor: 0.44704 },
      { id: 'kn', label: 'Knot', symbol: 'kn', factor: 0.5144444444444445 },
      { id: 'fts', label: 'Feet per second', symbol: 'ft/s', factor: 0.3048 },
    ],
  },
  {
    id: 'time',
    label: 'Time',
    icon: '⏱️',
    units: [
      { id: 'ms', label: 'Millisecond', symbol: 'ms', factor: 0.001 },
      { id: 's', label: 'Second', symbol: 's', factor: 1 },
      { id: 'min', label: 'Minute', symbol: 'min', factor: 60 },
      { id: 'h', label: 'Hour', symbol: 'h', factor: 3600 },
      { id: 'day', label: 'Day', symbol: 'day', factor: 86400 },
      { id: 'week', label: 'Week', symbol: 'week', factor: 604800 },
      { id: 'year', label: 'Year', symbol: 'yr', factor: 31536000 },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    icon: '💾',
    units: [
      { id: 'bit', label: 'Bit', symbol: 'bit', factor: 0.125 },
      { id: 'b', label: 'Byte', symbol: 'B', factor: 1 },
      { id: 'kb', label: 'Kilobyte', symbol: 'KB', factor: 1000 },
      { id: 'mb', label: 'Megabyte', symbol: 'MB', factor: 1000000 },
      { id: 'gb', label: 'Gigabyte', symbol: 'GB', factor: 1000000000 },
      { id: 'tb', label: 'Terabyte', symbol: 'TB', factor: 1000000000000 },
      { id: 'kib', label: 'Kibibyte', symbol: 'KiB', factor: 1024 },
      { id: 'mib', label: 'Mebibyte', symbol: 'MiB', factor: 1048576 },
      { id: 'gib', label: 'Gibibyte', symbol: 'GiB', factor: 1073741824 },
      { id: 'tib', label: 'Tebibyte', symbol: 'TiB', factor: 1099511627776 },
    ],
  },
];

function toCelsius(value: number, unitId: string): number {
  switch (unitId) {
    case 'f':
      return ((value - 32) * 5) / 9;
    case 'k':
      return value - 273.15;
    case 'r':
      return ((value - 491.67) * 5) / 9;
    case 're':
      return value * 1.25;
    default:
      return value;
  }
}

function fromCelsius(celsius: number, unitId: string): number {
  switch (unitId) {
    case 'f':
      return (celsius * 9) / 5 + 32;
    case 'k':
      return celsius + 273.15;
    case 'r':
      return ((celsius + 273.15) * 9) / 5;
    case 're':
      return celsius * 0.8;
    default:
      return celsius;
  }
}

function convertValue(value: number, categoryId: string, from: Unit, to: Unit): number {
  if (categoryId === 'temperature') {
    return fromCelsius(toCelsius(value, from.id), to.id);
  }
  return (value * from.factor) / to.factor;
}

function formatResult(value: number): string {
  if (!isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-9)) {
    return value.toExponential(6);
  }
  return new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 10,
    useGrouping: true,
  }).format(value);
}

export default function UnitConverterClient() {
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [value, setValue] = useState('1');
  const [fromId, setFromId] = useState(CATEGORIES[0].units[0].id);
  const [toId, setToId] = useState(CATEGORIES[0].units[1].id);

  const category = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0];
  const fromUnit = category.units.find((u) => u.id === fromId) ?? category.units[0];
  const toUnit = category.units.find((u) => u.id === toId) ?? category.units[1];

  const numericValue = parseFloat(value);

  const result = useMemo(() => {
    if (Number.isNaN(numericValue)) return null;
    return convertValue(numericValue, category.id, fromUnit, toUnit);
  }, [numericValue, category.id, fromUnit, toUnit]);

  const handleCategoryChange = (id: string) => {
    const next = CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
    setCategoryId(id);
    setFromId(next.units[0].id);
    setToId(next.units[Math.min(1, next.units.length - 1)].id);
  };

  const handleSwap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  const fromSymbol = fromUnit.symbol;
  const toSymbol = toUnit.symbol;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ToolHeader
          title="Unit Converter"
          description="Convert between units of length, weight, temperature, area, volume, speed, time and data"
          clientSideOnly
        />

        <ToolContainer>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCategoryChange(c.id)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      c.id === categoryId
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span>{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="unit-value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Value
              </label>
              <input
                id="unit-value"
                type="number"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
              <div>
                <label htmlFor="unit-from" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From
                </label>
                <select
                  id="unit-from"
                  value={fromId}
                  onChange={(e) => setFromId(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {category.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSwap}
                aria-label="Swap units"
                title="Swap units"
                className="mb-0.5 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                  <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>

              <div>
                <label htmlFor="unit-to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  To
                </label>
                <select
                  id="unit-to"
                  value={toId}
                  onChange={(e) => setToId(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {category.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Number.isNaN(numericValue) ? 'Enter a value to see the result' : `${formatResult(numericValue)} ${fromSymbol} =`}
              </p>
              <p className="mt-1 break-all text-3xl font-bold text-gray-900 dark:text-white">
                {result === null ? '—' : `${formatResult(result)} ${toSymbol}`}
              </p>
              {result !== null && (
                <div className="mt-3">
                  <CopyButton
                    text={`${formatResult(result)} ${toSymbol}`}
                    label="Copy Result"
                  />
                </div>
              )}
            </div>
          </div>
        </ToolContainer>

        <RelatedTools currentSlug="unit-converter" />

        <div className="mt-12 prose prose-gray dark:prose-invert max-w-none">
          <h2>About Unit Converter</h2>
          <p>
            This tool converts values between units of length, weight, temperature, area, volume, speed, time
            and digital storage. Results update instantly as you type.
          </p>
          <h3>How to use this tool</h3>
          <ol>
            <li>Pick a category such as length, weight or temperature</li>
            <li>Enter the value you want to convert</li>
            <li>Choose the unit you&apos;re converting from and to</li>
            <li>Use the swap button to quickly reverse the conversion</li>
            <li>Copy the result to your clipboard</li>
          </ol>
          <h3>Privacy</h3>
          <p>
            All conversions happen instantly in your browser. Nothing you type is sent anywhere.
          </p>
        </div>
      </div>
    </div>
  );
}
