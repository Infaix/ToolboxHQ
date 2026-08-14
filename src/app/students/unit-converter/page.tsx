"use client";

import { useState } from 'react';

const conversionFactors: Record<string, Record<string, number>> = {
  // Length
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
  // Mass
  mass: {
    mg: 0.001,
    g: 0.001,
    kg: 1,
    ton: 1000,
    oz: 0.0283495,
    lb: 0.453592,
  },
  // Time
  time: {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
  },
  // Area
  area: {
    mm2: 0.000001,
    cm2: 0.0001,
    m2: 1,
    km2: 1000000,
    in2: 0.00064516,
    ft2: 0.092903,
    yd2: 0.836127,
  },
  // Volume
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
  // Temperature (special handling needed)
  temperature: {
    c: 'c',
    f: 'f',
    k: 'k',
  },
  // Speed
  speed: {
    mps: 1,
    kmh: 3.6,
    mph: 0.44704,
    kts: 0.514444,
  },
  // Pressure
  pressure: {
    pa: 1,
    kpa: 1000,
    MPa: 1000000,
    psi: 6894.76,
    atm: 101325,
  },
  // Energy
  energy: {
    j: 1,
    kJ: 1000,
    cal: 4.184,
    kcal: 4184,
    BTU: 1055.06,
  },
};

export function useUnitConverter() {
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('m');
  const [value, setValue] = useState(1);
  const [convertedValue, setConvertedValue] = useState(1);

  const calculateConversion = useCallback(() => {
    const fromFactor = conversionFactors.length?.[fromUnit] ?? 1;
    const toFactor = conversionFactors.length?.[toUnit] ?? 1;
    
    // For temperature, special handling needed
    if (fromUnit === 'temperature' || toUnit === 'temperature') {
      let celsius: number;
      if (fromUnit === 'c') celsius = parseFloat(value) ?? 0;
      else if (fromUnit === 'f') celsius = ((parseFloat(value) ?? 0) - 32) * 5 / 9;
      else if (fromUnit === 'k') celsius = (parseFloat(value) ?? 0) - 273.15;
      else celsius = 0;
   
      if (toUnit === 'c') return celsius;
      if (toUnit === 'f') return celsius * 9 / 5 + 32;
      if (toUnit === 'k') return celsius + 273.15;
      return celsius;
    } else {
      const valueInBase = parseFloat(value) * fromFactor;
      const result = valueInBase / toFactor;
      setConvertedValue(result !== undefined && !isNaN(result) ? result : 0);
    }
  }, [value, fromUnit, toUnit]);

  return {
    fromUnit,
    setFromUnit,
    toUnit,
    setToUnit,
    value,
    setValue,
    convertedValue,
    calculateConversion,
  };
}

export default function UnitConverterPage() {
  const { fromUnit, toUnit, value, setValue, convertedValue, calculateConversion } = useUnitConverter();

  // Simple string class names (not template literals)
  const inputClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white';
  const buttonClass = 'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700';
  const ghostClass = 'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800';
  const cardClass = 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800';
  const titleClass = 'text-xl font-bold text-gray-900 dark:text-white';
  const subtitleClass = 'text-base text-gray-600 dark:text-gray-400';
  const resultCardClass = 'mt-6 rounded-xl border p-6 bg-gray-50 dark:bg-gray-800';

  const isDark = true; // simplified for this build

  // Pre-compute conversion result display
  let conversionResult = null;

  // Always compute the conversion when page loads
  // This ensures the convertedValue state is updated
  calculateConversion();

  // Build the conversion display
  conversionResult = (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        1 {fromUnit} = {convertedValue} {toUnit}
      </p>
      <div>
        <button
          type="button"
          onClick={calculateConversion}
          className={buttonClass}
          aria-label="Convert units"
        >
          Convert
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 border-b border-gray-300 pb-4">
          <a
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
          </a>
          <h1 className={titleClass}>
            Unit Converter
          </h1>
        </nav>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Convert Units
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Select the category, enter a value, and choose the target unit.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                From
              </label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className={inputClass}
                aria-label="Convert from"
              >
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="m">m</option>
                <option value="km">km</option>
                <option value="in">in</option>
                <option value="ft">ft</option>
                <option value="yd">yd</option>
                <option value="mi">mi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                To
              </label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className={inputClass}
                aria-label="Convert to"
              >
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="m">m</option>
                <option value="km">km</option>
                <option value="in">in</option>
                <option value="ft">ft</option>
                <option value="yd">yd</option>
                <option value="mi">mi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Value
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={inputClass}
              aria-label="Value to convert"
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            1 {fromUnit} = {convertedValue} {toUnit}
          </p>
          <div>
            <button
              type="button"
              onClick={calculateConversion}
              className={buttonClass}
              aria-label="Convert units"
            >
              Convert
            </button>
          </div>
        </div>

        <footer className="mt-8 pt-8 border-t border-gray-300 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            All conversion data stays locally in your browser. No account or cloud sync required.
          </p>
        </footer>
      </div>
    </div>
  );
}