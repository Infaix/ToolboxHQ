"use client";

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

type SubjectKey = 'general' | 'methods' | 'specialist';

interface FormulaVariable {
  name: string;
  meaning: string;
  unit?: string;
}

interface MathFormula {
  id: string;
  subject: SubjectKey;
  topic: string;
  name: string;
  formula: string;
  description: string;
  variables: FormulaVariable[];
}

const SUBJECT_LABELS: Record<SubjectKey, string> = {
  general: 'General Mathematics',
  methods: 'Mathematical Methods',
  specialist: 'Specialist Mathematics',
};

const TOPIC_ORDER: Record<SubjectKey, string[]> = {
  general: [
    'Measurement & Geometry',
    'Financial Mathematics',
    'Matrices',
    'Networks & Decision Mathematics',
    'Data Analysis',
  ],
  methods: [
    'Algebra & Functions',
    'Exponentials & Logarithms',
    'Trigonometry',
    'Differentiation',
    'Integration',
    'Probability & Statistics',
  ],
  specialist: [
    'Complex Numbers',
    'Vectors',
    'Trigonometry',
    'Differential Equations',
    'Kinematics & Mechanics',
    'Calculus Techniques',
  ],
};

// Formulas are structured educational data representing the VCAA VCE
// Mathematics formula sheets (not a copy of the PDF). They are grouped by
// subject and topic so they can be filtered, searched and displayed.
const FORMULAS: MathFormula[] = [
  // -------------------------------------------------------------------------
  // General Mathematics
  // -------------------------------------------------------------------------
  {
    id: 'gm-triangle-area',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Area of a triangle',
    formula: 'A = ½ × b × h',
    description: 'Area of a triangle using its base and perpendicular height.',
    variables: [
      { name: 'A', meaning: 'area', unit: 'm²' },
      { name: 'b', meaning: 'base length', unit: 'm' },
      { name: 'h', meaning: 'perpendicular height', unit: 'm' },
    ],
  },
  {
    id: 'gm-trapezium-area',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Area of a trapezium',
    formula: 'A = ½ × (a + b) × h',
    description: 'Area of a trapezium from its parallel sides and height.',
    variables: [
      { name: 'A', meaning: 'area', unit: 'm²' },
      { name: 'a, b', meaning: 'lengths of the parallel sides', unit: 'm' },
      { name: 'h', meaning: 'perpendicular height', unit: 'm' },
    ],
  },
  {
    id: 'gm-circle-area',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Area of a circle',
    formula: 'A = π × r²',
    description: 'Area enclosed by a circle of radius r.',
    variables: [
      { name: 'A', meaning: 'area', unit: 'm²' },
      { name: 'r', meaning: 'radius', unit: 'm' },
    ],
  },
  {
    id: 'gm-circle-circumference',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Circumference of a circle',
    formula: 'C = 2 × π × r',
    description: 'Distance around a circle of radius r.',
    variables: [
      { name: 'C', meaning: 'circumference', unit: 'm' },
      { name: 'r', meaning: 'radius', unit: 'm' },
    ],
  },
  {
    id: 'gm-pythagoras',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Pythagoras\u2019 theorem',
    formula: 'c² = a² + b²',
    description: 'Relates the sides of a right-angled triangle.',
    variables: [
      { name: 'c', meaning: 'hypotenuse (longest side)', unit: 'm' },
      { name: 'a, b', meaning: 'the other two sides', unit: 'm' },
    ],
  },
  {
    id: 'gm-sine-rule',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Sine rule',
    formula: 'a / sin(A) = b / sin(B) = c / sin(C)',
    description: 'Relates sides and angles in any triangle.',
    variables: [
      { name: 'a, b, c', meaning: 'side lengths', unit: 'm' },
      { name: 'A, B, C', meaning: 'angles opposite the respective sides', unit: 'degrees' },
    ],
  },
  {
    id: 'gm-cosine-rule',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Cosine rule',
    formula: 'c² = a² + b² − 2ab cos(C)',
    description: 'Finds a side or angle in any triangle.',
    variables: [
      { name: 'c', meaning: 'side opposite angle C', unit: 'm' },
      { name: 'a, b', meaning: 'the other two sides', unit: 'm' },
      { name: 'C', meaning: 'included angle', unit: 'degrees' },
    ],
  },
  {
    id: 'gm-triangle-area-sides',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Area of a triangle (two sides, included angle)',
    formula: 'A = ½ × a × b × sin(C)',
    description: 'Area of a triangle from two sides and the included angle.',
    variables: [
      { name: 'A', meaning: 'area', unit: 'm²' },
      { name: 'a, b', meaning: 'two side lengths', unit: 'm' },
      { name: 'C', meaning: 'included angle', unit: 'degrees' },
    ],
  },
  {
    id: 'gm-arc-length',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Arc length of a sector',
    formula: 'l = r × θ',
    description: 'Length of the arc of a sector with angle θ in radians.',
    variables: [
      { name: 'l', meaning: 'arc length', unit: 'm' },
      { name: 'r', meaning: 'radius', unit: 'm' },
      { name: 'θ', meaning: 'central angle', unit: 'radians' },
    ],
  },
  {
    id: 'gm-sector-area',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Area of a sector',
    formula: 'A = ½ × r² × θ',
    description: 'Area of a sector with angle θ in radians.',
    variables: [
      { name: 'A', meaning: 'sector area', unit: 'm²' },
      { name: 'r', meaning: 'radius', unit: 'm' },
      { name: 'θ', meaning: 'central angle', unit: 'radians' },
    ],
  },
  {
    id: 'gm-prism-volume',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Volume of a prism',
    formula: 'V = A × h',
    description: 'Volume of any prism using the base area and height.',
    variables: [
      { name: 'V', meaning: 'volume', unit: 'm³' },
      { name: 'A', meaning: 'area of the cross-section/base', unit: 'm²' },
      { name: 'h', meaning: 'height', unit: 'm' },
    ],
  },
  {
    id: 'gm-pyramid-volume',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Volume of a pyramid',
    formula: 'V = ⅓ × A × h',
    description: 'Volume of a pyramid using the base area and height.',
    variables: [
      { name: 'V', meaning: 'volume', unit: 'm³' },
      { name: 'A', meaning: 'base area', unit: 'm²' },
      { name: 'h', meaning: 'height', unit: 'm' },
    ],
  },
  {
    id: 'gm-cylinder-volume',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Volume of a cylinder',
    formula: 'V = π × r² × h',
    description: 'Volume of a cylinder.',
    variables: [
      { name: 'V', meaning: 'volume', unit: 'm³' },
      { name: 'r', meaning: 'radius', unit: 'm' },
      { name: 'h', meaning: 'height', unit: 'm' },
    ],
  },
  {
    id: 'gm-cone-volume',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Volume of a cone',
    formula: 'V = ⅓ × π × r² × h',
    description: 'Volume of a cone.',
    variables: [
      { name: 'V', meaning: 'volume', unit: 'm³' },
      { name: 'r', meaning: 'radius of the base', unit: 'm' },
      { name: 'h', meaning: 'height', unit: 'm' },
    ],
  },
  {
    id: 'gm-sphere-volume',
    subject: 'general',
    topic: 'Measurement & Geometry',
    name: 'Volume of a sphere',
    formula: 'V = 4/3 × π × r³',
    description: 'Volume of a sphere.',
    variables: [
      { name: 'V', meaning: 'volume', unit: 'm³' },
      { name: 'r', meaning: 'radius', unit: 'm' },
    ],
  },
  {
    id: 'gm-simple-interest',
    subject: 'general',
    topic: 'Financial Mathematics',
    name: 'Simple interest',
    formula: 'I = P × r × n',
    description: 'Interest calculated only on the original principal.',
    variables: [
      { name: 'I', meaning: 'interest', unit: '$' },
      { name: 'P', meaning: 'principal (amount invested or borrowed)', unit: '$' },
      { name: 'r', meaning: 'interest rate per period (as a decimal)', unit: '' },
      { name: 'n', meaning: 'number of periods', unit: '' },
    ],
  },
  {
    id: 'gm-compound-interest',
    subject: 'general',
    topic: 'Financial Mathematics',
    name: 'Compound interest',
    formula: 'A = P × (1 + r)ⁿ',
    description: 'Amount after interest is compounded each period.',
    variables: [
      { name: 'A', meaning: 'final amount', unit: '$' },
      { name: 'P', meaning: 'principal', unit: '$' },
      { name: 'r', meaning: 'interest rate per compounding period (as a decimal)', unit: '' },
      { name: 'n', meaning: 'number of compounding periods', unit: '' },
    ],
  },
  {
    id: 'gm-future-value-annuity',
    subject: 'general',
    topic: 'Financial Mathematics',
    name: 'Future value of an ordinary annuity',
    formula: 'FV = M × [((1 + r)ⁿ − 1) / r]',
    description: 'Total value of regular payments (each M) after n periods.',
    variables: [
      { name: 'FV', meaning: 'future value', unit: '$' },
      { name: 'M', meaning: 'payment each period', unit: '$' },
      { name: 'r', meaning: 'interest rate per period (as a decimal)', unit: '' },
      { name: 'n', meaning: 'number of payments', unit: '' },
    ],
  },
  {
    id: 'gm-present-value-annuity',
    subject: 'general',
    topic: 'Financial Mathematics',
    name: 'Present value of an ordinary annuity',
    formula: 'PV = M × [(1 − (1 + r)⁻ⁿ) / r]',
    description: 'Lump sum now that is equivalent to a series of future payments.',
    variables: [
      { name: 'PV', meaning: 'present value', unit: '$' },
      { name: 'M', meaning: 'payment each period', unit: '$' },
      { name: 'r', meaning: 'interest rate per period (as a decimal)', unit: '' },
      { name: 'n', meaning: 'number of payments', unit: '' },
    ],
  },
  {
    id: 'gm-straight-line-depreciation',
    subject: 'general',
    topic: 'Financial Mathematics',
    name: 'Straight-line depreciation',
    formula: 'S = V₀ × (1 − r × n)',
    description: 'Book value after equal depreciation each period.',
    variables: [
      { name: 'S', meaning: 'book value after n periods', unit: '$' },
      { name: 'V₀', meaning: 'initial value', unit: '$' },
      { name: 'r', meaning: 'depreciation rate per period (as a decimal)', unit: '' },
      { name: 'n', meaning: 'number of periods', unit: '' },
    ],
  },
  {
    id: 'gm-reducing-balance-depreciation',
    subject: 'general',
    topic: 'Financial Mathematics',
    name: 'Reducing-balance depreciation',
    formula: 'S = V₀ × (1 − r)ⁿ',
    description: 'Book value when a fixed percentage is lost each period.',
    variables: [
      { name: 'S', meaning: 'book value after n periods', unit: '$' },
      { name: 'V₀', meaning: 'initial value', unit: '$' },
      { name: 'r', meaning: 'depreciation rate per period (as a decimal)', unit: '' },
      { name: 'n', meaning: 'number of periods', unit: '' },
    ],
  },
  {
    id: 'gm-determinant',
    subject: 'general',
    topic: 'Matrices',
    name: 'Determinant of a 2 × 2 matrix',
    formula: 'det(A) = a·d − b·c',
    description: 'For A = [[a, b], [c, d]]. Non-zero determinant means A is invertible.',
    variables: [
      { name: 'a, b, c, d', meaning: 'entries of the 2 × 2 matrix', unit: '' },
      { name: 'det(A)', meaning: 'determinant', unit: '' },
    ],
  },
  {
    id: 'gm-inverse-2x2',
    subject: 'general',
    topic: 'Matrices',
    name: 'Inverse of a 2 × 2 matrix',
    formula: 'A⁻¹ = 1/(a·d − b·c) × [[d, −b], [−c, a]]',
    description: 'Inverse of A = [[a, b], [c, d]], provided det(A) ≠ 0.',
    variables: [
      { name: 'a, b, c, d', meaning: 'entries of the 2 × 2 matrix', unit: '' },
      { name: 'det(A)', meaning: 'determinant (a·d − b·c)', unit: '' },
    ],
  },
  {
    id: 'gm-matrix-simultaneous',
    subject: 'general',
    topic: 'Matrices',
    name: 'Solving simultaneous equations (matrix method)',
    formula: 'X = A⁻¹ × B',
    description: 'For AX = B, multiply both sides by A⁻¹ to solve for X.',
    variables: [
      { name: 'A', meaning: 'coefficient matrix', unit: '' },
      { name: 'X', meaning: 'column matrix of unknowns', unit: '' },
      { name: 'B', meaning: 'column matrix of constants', unit: '' },
    ],
  },
  {
    id: 'gm-eulers-rule',
    subject: 'general',
    topic: 'Networks & Decision Mathematics',
    name: 'Euler\u2019s rule',
    formula: 'v + f − e = 2',
    description: 'Relates the number of vertices, faces and edges of a connected planar graph.',
    variables: [
      { name: 'v', meaning: 'number of vertices', unit: '' },
      { name: 'f', meaning: 'number of faces', unit: '' },
      { name: 'e', meaning: 'number of edges', unit: '' },
    ],
  },
  {
    id: 'gm-degree-sum',
    subject: 'general',
    topic: 'Networks & Decision Mathematics',
    name: 'Sum of degrees',
    formula: 'Σ deg(v) = 2 × e',
    description: 'The sum of the degrees of all vertices is twice the number of edges.',
    variables: [
      { name: 'deg(v)', meaning: 'degree of vertex v', unit: '' },
      { name: 'e', meaning: 'number of edges', unit: '' },
    ],
  },
  {
    id: 'gm-mean',
    subject: 'general',
    topic: 'Data Analysis',
    name: 'Mean',
    formula: 'x̄ = Σx / n',
    description: 'Arithmetic mean (average) of a data set.',
    variables: [
      { name: 'x̄', meaning: 'mean', unit: 'units of data' },
      { name: 'Σx', meaning: 'sum of all data values', unit: '' },
      { name: 'n', meaning: 'number of values', unit: '' },
    ],
  },
  {
    id: 'gm-standard-deviation',
    subject: 'general',
    topic: 'Data Analysis',
    name: 'Sample standard deviation',
    formula: 's = √( Σ(x − x̄)² / (n − 1) )',
    description: 'Measure of how spread out a sample is around its mean.',
    variables: [
      { name: 's', meaning: 'standard deviation', unit: 'units of data' },
      { name: 'x', meaning: 'data values', unit: '' },
      { name: 'x̄', meaning: 'sample mean', unit: '' },
      { name: 'n', meaning: 'sample size', unit: '' },
    ],
  },
  {
    id: 'gm-iqr',
    subject: 'general',
    topic: 'Data Analysis',
    name: 'Interquartile range',
    formula: 'IQR = Q₃ − Q₁',
    description: 'Spread of the middle 50% of a data set.',
    variables: [
      { name: 'IQR', meaning: 'interquartile range', unit: 'units of data' },
      { name: 'Q₃', meaning: 'upper quartile (75th percentile)', unit: '' },
      { name: 'Q₁', meaning: 'lower quartile (25th percentile)', unit: '' },
    ],
  },
  {
    id: 'gm-least-squares',
    subject: 'general',
    topic: 'Data Analysis',
    name: 'Least-squares line',
    formula: 'ŷ = a + b·x,  b = r·(s_y/s_x),  a = ȳ − b·x̄',
    description: 'Line of best fit found by minimising squared residuals.',
    variables: [
      { name: 'b', meaning: 'slope', unit: '' },
      { name: 'r', meaning: 'correlation coefficient', unit: '' },
      { name: 's_y, s_x', meaning: 'standard deviations of y and x', unit: '' },
      { name: 'a', meaning: 'y-intercept', unit: '' },
      { name: 'x̄, ȳ', meaning: 'means of x and y', unit: '' },
    ],
  },
  {
    id: 'gm-r-squared',
    subject: 'general',
    topic: 'Data Analysis',
    name: 'Coefficient of determination',
    formula: 'r²',
    description: 'Proportion of variation in y explained by the regression line.',
    variables: [
      { name: 'r²', meaning: 'coefficient of determination (0 to 1)', unit: '' },
    ],
  },

  // -------------------------------------------------------------------------
  // Mathematical Methods
  // -------------------------------------------------------------------------
  {
    id: 'mm-quadratic',
    subject: 'methods',
    topic: 'Algebra & Functions',
    name: 'Quadratic formula',
    formula: 'x = (−b ± √(b² − 4ac)) / (2a)',
    description: 'Solutions of the quadratic equation ax² + bx + c = 0.',
    variables: [
      { name: 'a', meaning: 'coefficient of x²', unit: '' },
      { name: 'b', meaning: 'coefficient of x', unit: '' },
      { name: 'c', meaning: 'constant term', unit: '' },
      { name: 'Δ', meaning: 'discriminant b² − 4ac (determines the number of roots)', unit: '' },
    ],
  },
  {
    id: 'mm-index-laws',
    subject: 'methods',
    topic: 'Algebra & Functions',
    name: 'Index laws',
    formula: 'aᵐ·aⁿ = aᵐ⁺ⁿ,  (aᵐ)ⁿ = aᵐⁿ,  aᵐ/aⁿ = aᵐ⁻ⁿ,  a⁻ᵐ = 1/aᵐ,  a⁰ = 1',
    description: 'Laws for simplifying expressions with powers.',
    variables: [
      { name: 'a', meaning: 'base (a > 0)', unit: '' },
      { name: 'm, n', meaning: 'exponents', unit: '' },
    ],
  },
  {
    id: 'mm-log-laws',
    subject: 'methods',
    topic: 'Exponentials & Logarithms',
    name: 'Logarithm laws',
    formula: 'log_a(m·n) = log_a m + log_a n,  log_a(m/n) = log_a m − log_a n,  log_a(mⁿ) = n·log_a m',
    description: 'Laws for simplifying logarithmic expressions.',
    variables: [
      { name: 'a', meaning: 'base (a > 0, a ≠ 1)', unit: '' },
      { name: 'm, n', meaning: 'positive numbers', unit: '' },
    ],
  },
  {
    id: 'mm-change-of-base',
    subject: 'methods',
    topic: 'Exponentials & Logarithms',
    name: 'Change of base',
    formula: 'log_a x = log_b x / log_b a',
    description: 'Converts a logarithm to a different base.',
    variables: [
      { name: 'a, b', meaning: 'bases', unit: '' },
      { name: 'x', meaning: 'argument (x > 0)', unit: '' },
    ],
  },
  {
    id: 'mm-exponential-model',
    subject: 'methods',
    topic: 'Exponentials & Logarithms',
    name: 'Exponential growth / decay',
    formula: 'A = A₀ × e^(k·t)',
    description: 'Models growth (k > 0) or decay (k < 0) over time.',
    variables: [
      { name: 'A', meaning: 'amount after time t', unit: '' },
      { name: 'A₀', meaning: 'initial amount', unit: '' },
      { name: 'k', meaning: 'growth/decay constant', unit: '' },
      { name: 't', meaning: 'time', unit: '' },
    ],
  },
  {
    id: 'mm-pythagorean-id',
    subject: 'methods',
    topic: 'Trigonometry',
    name: 'Pythagorean identity',
    formula: 'sin²θ + cos²θ = 1',
    description: 'Fundamental identity relating sine and cosine.',
    variables: [{ name: 'θ', meaning: 'angle', unit: 'radians or degrees' }],
  },
  {
    id: 'mm-tan-identity',
    subject: 'methods',
    topic: 'Trigonometry',
    name: 'Tangent identity',
    formula: 'tan θ = sin θ / cos θ',
    description: 'Defines tangent in terms of sine and cosine.',
    variables: [{ name: 'θ', meaning: 'angle', unit: 'radians or degrees' }],
  },
  {
    id: 'mm-power-rule',
    subject: 'methods',
    topic: 'Differentiation',
    name: 'Power rule',
    formula: 'd/dx [xⁿ] = n·xⁿ⁻¹',
    description: 'Derivative of a power function.',
    variables: [{ name: 'n', meaning: 'real exponent', unit: '' }],
  },
  {
    id: 'mm-product-rule',
    subject: 'methods',
    topic: 'Differentiation',
    name: 'Product rule',
    formula: 'd/dx [u·v] = u′·v + u·v′',
    description: 'Derivative of a product of two functions.',
    variables: [
      { name: 'u, v', meaning: 'differentiable functions of x', unit: '' },
    ],
  },
  {
    id: 'mm-quotient-rule',
    subject: 'methods',
    topic: 'Differentiation',
    name: 'Quotient rule',
    formula: 'd/dx [u/v] = (u′·v − u·v′) / v²',
    description: 'Derivative of a quotient of two functions.',
    variables: [
      { name: 'u, v', meaning: 'differentiable functions of x (v ≠ 0)', unit: '' },
    ],
  },
  {
    id: 'mm-chain-rule',
    subject: 'methods',
    topic: 'Differentiation',
    name: 'Chain rule',
    formula: 'dy/dx = dy/du × du/dx',
    description: 'Derivative of a composite function.',
    variables: [
      { name: 'y', meaning: 'function of u', unit: '' },
      { name: 'u', meaning: 'function of x', unit: '' },
    ],
  },
  {
    id: 'mm-derivative-exp',
    subject: 'methods',
    topic: 'Differentiation',
    name: 'Derivative of exponentials',
    formula: 'd/dx [eˣ] = eˣ,  d/dx [e^(k·x)] = k·e^(k·x)',
    description: 'The exponential function is its own derivative.',
    variables: [{ name: 'k', meaning: 'constant', unit: '' }],
  },
  {
    id: 'mm-derivative-log',
    subject: 'methods',
    topic: 'Differentiation',
    name: 'Derivative of the natural logarithm',
    formula: 'd/dx [ln x] = 1/x',
    description: 'Derivative of ln x for x > 0.',
    variables: [{ name: 'x', meaning: 'positive real number', unit: '' }],
  },
  {
    id: 'mm-derivative-sin',
    subject: 'methods',
    topic: 'Differentiation',
    name: 'Derivative of sine',
    formula: 'd/dx [sin(k·x)] = k·cos(k·x)',
    description: 'Derivative of sin(kx).',
    variables: [{ name: 'k', meaning: 'constant', unit: '' }],
  },
  {
    id: 'mm-derivative-cos',
    subject: 'methods',
    topic: 'Differentiation',
    name: 'Derivative of cosine',
    formula: 'd/dx [cos(k·x)] = −k·sin(k·x)',
    description: 'Derivative of cos(kx).',
    variables: [{ name: 'k', meaning: 'constant', unit: '' }],
  },
  {
    id: 'mm-derivative-tan',
    subject: 'methods',
    topic: 'Differentiation',
    name: 'Derivative of tangent',
    formula: 'd/dx [tan x] = sec²x',
    description: 'Derivative of tan x.',
    variables: [],
  },
  {
    id: 'mm-integral-power',
    subject: 'methods',
    topic: 'Integration',
    name: 'Power rule for integration',
    formula: '∫ xⁿ dx = xⁿ⁺¹/(n + 1) + c,  (n ≠ −1)',
    description: 'Antiderivative of a power function.',
    variables: [
      { name: 'n', meaning: 'real exponent (n ≠ −1)', unit: '' },
      { name: 'c', meaning: 'constant of integration', unit: '' },
    ],
  },
  {
    id: 'mm-integral-exp',
    subject: 'methods',
    topic: 'Integration',
    name: 'Integral of exponentials',
    formula: '∫ e^x dx = eˣ + c,  ∫ e^(k·x) dx = e^(k·x)/k + c',
    description: 'Antiderivatives of exponential functions.',
    variables: [
      { name: 'k', meaning: 'constant (k ≠ 0)', unit: '' },
      { name: 'c', meaning: 'constant of integration', unit: '' },
    ],
  },
  {
    id: 'mm-integral-reciprocal',
    subject: 'methods',
    topic: 'Integration',
    name: 'Integral of 1/x',
    formula: '∫ 1/x dx = ln|x| + c',
    description: 'Antiderivative of the reciprocal function.',
    variables: [
      { name: 'x', meaning: 'non-zero real number', unit: '' },
      { name: 'c', meaning: 'constant of integration', unit: '' },
    ],
  },
  {
    id: 'mm-integral-sin-cos',
    subject: 'methods',
    topic: 'Integration',
    name: 'Integrals of sine and cosine',
    formula: '∫ sin(k·x) dx = −cos(k·x)/k + c,  ∫ cos(k·x) dx = sin(k·x)/k + c',
    description: 'Antiderivatives of sine and cosine.',
    variables: [
      { name: 'k', meaning: 'constant (k ≠ 0)', unit: '' },
      { name: 'c', meaning: 'constant of integration', unit: '' },
    ],
  },
  {
    id: 'mm-definite-integral',
    subject: 'methods',
    topic: 'Integration',
    name: 'Definite integral (area)',
    formula: 'A = ∫ₐᵇ f(x) dx = F(b) − F(a)',
    description: 'Net signed area under f between x = a and x = b.',
    variables: [
      { name: 'A', meaning: 'net area', unit: 'units²' },
      { name: 'f(x)', meaning: 'integrand', unit: '' },
      { name: 'F(x)', meaning: 'antiderivative of f', unit: '' },
      { name: 'a, b', meaning: 'limits of integration', unit: '' },
    ],
  },
  {
    id: 'mm-permutations',
    subject: 'methods',
    topic: 'Probability & Statistics',
    name: 'Permutations',
    formula: 'nPr = n! / (n − r)!',
    description: 'Number of ordered arrangements of r items from n.',
    variables: [
      { name: 'n', meaning: 'total number of items', unit: '' },
      { name: 'r', meaning: 'number chosen', unit: '' },
    ],
  },
  {
    id: 'mm-combinations',
    subject: 'methods',
    topic: 'Probability & Statistics',
    name: 'Combinations',
    formula: 'nCr = n! / (r! × (n − r)!)',
    description: 'Number of unordered selections of r items from n.',
    variables: [
      { name: 'n', meaning: 'total number of items', unit: '' },
      { name: 'r', meaning: 'number chosen', unit: '' },
    ],
  },
  {
    id: 'mm-binomial-probability',
    subject: 'methods',
    topic: 'Probability & Statistics',
    name: 'Binomial probability',
    formula: 'Pr(X = r) = nCr × pʳ × (1 − p)ⁿ⁻ʳ',
    description: 'Probability of exactly r successes in n independent trials.',
    variables: [
      { name: 'n', meaning: 'number of trials', unit: '' },
      { name: 'r', meaning: 'number of successes', unit: '' },
      { name: 'p', meaning: 'probability of success per trial', unit: '' },
    ],
  },
  {
    id: 'mm-binomial-mean-variance',
    subject: 'methods',
    topic: 'Probability & Statistics',
    name: 'Mean and variance of a binomial distribution',
    formula: 'E(X) = n·p,  Var(X) = n·p·(1 − p)',
    description: 'Expected value and variance for X ~ Bi(n, p).',
    variables: [
      { name: 'n', meaning: 'number of trials', unit: '' },
      { name: 'p', meaning: 'probability of success per trial', unit: '' },
    ],
  },
  {
    id: 'mm-standard-normal',
    subject: 'methods',
    topic: 'Probability & Statistics',
    name: 'Standard normal variable',
    formula: 'Z = (X − μ) / σ',
    description: 'Converts a normal variable to the standard normal distribution.',
    variables: [
      { name: 'Z', meaning: 'standard score', unit: '' },
      { name: 'X', meaning: 'normal variable', unit: '' },
      { name: 'μ', meaning: 'mean', unit: '' },
      { name: 'σ', meaning: 'standard deviation', unit: '' },
    ],
  },

  // -------------------------------------------------------------------------
  // Specialist Mathematics
  // -------------------------------------------------------------------------
  {
    id: 'sp-modulus',
    subject: 'specialist',
    topic: 'Complex Numbers',
    name: 'Modulus of a complex number',
    formula: '|z| = √(a² + b²)',
    description: 'Distance of z = a + bi from the origin.',
    variables: [
      { name: 'a', meaning: 'real part', unit: '' },
      { name: 'b', meaning: 'imaginary part', unit: '' },
    ],
  },
  {
    id: 'sp-polar-form',
    subject: 'specialist',
    topic: 'Complex Numbers',
    name: 'Polar form',
    formula: 'z = r(cos θ + i·sin θ) = r·cis θ',
    description: 'Complex number in terms of modulus r and argument θ.',
    variables: [
      { name: 'r', meaning: 'modulus |z|', unit: '' },
      { name: 'θ', meaning: 'argument', unit: 'radians' },
    ],
  },
  {
    id: 'sp-de-moivre',
    subject: 'specialist',
    topic: 'Complex Numbers',
    name: 'De Moivre\u2019s theorem',
    formula: '(r·cis θ)ⁿ = rⁿ·cis(n·θ)',
    description: 'Raises a complex number in polar form to a power.',
    variables: [
      { name: 'r', meaning: 'modulus', unit: '' },
      { name: 'θ', meaning: 'argument', unit: 'radians' },
      { name: 'n', meaning: 'integer power', unit: '' },
    ],
  },
  {
    id: 'sp-euler-formula',
    subject: 'specialist',
    topic: 'Complex Numbers',
    name: 'Euler\u2019s formula',
    formula: 'e^(i·θ) = cos θ + i·sin θ',
    description: 'Links exponentials to trigonometry.',
    variables: [{ name: 'θ', meaning: 'angle', unit: 'radians' }],
  },
  {
    id: 'sp-dot-product',
    subject: 'specialist',
    topic: 'Vectors',
    name: 'Dot (scalar) product',
    formula: 'a·b = |a||b|cos θ = a₁b₁ + a₂b₂ + a₃b₃',
    description: 'Scalar result of multiplying two vectors.',
    variables: [
      { name: 'a, b', meaning: 'vectors', unit: '' },
      { name: 'θ', meaning: 'angle between the vectors', unit: 'radians' },
      { name: 'a₁, a₂, a₃', meaning: 'components of a', unit: '' },
      { name: 'b₁, b₂, b₃', meaning: 'components of b', unit: '' },
    ],
  },
  {
    id: 'sp-cross-product-magnitude',
    subject: 'specialist',
    topic: 'Vectors',
    name: 'Magnitude of the cross product',
    formula: '|a × b| = |a||b|sin θ',
    description: 'Area of the parallelogram spanned by a and b.',
    variables: [
      { name: 'a, b', meaning: 'vectors', unit: '' },
      { name: 'θ', meaning: 'angle between the vectors', unit: 'radians' },
    ],
  },
  {
    id: 'sp-vector-line',
    subject: 'specialist',
    topic: 'Vectors',
    name: 'Vector equation of a line',
    formula: 'r = a + λ·b',
    description: 'Line through point a in direction b.',
    variables: [
      { name: 'r', meaning: 'position vector of a point on the line', unit: '' },
      { name: 'a', meaning: 'position vector of a known point', unit: '' },
      { name: 'b', meaning: 'direction vector', unit: '' },
      { name: 'λ', meaning: 'real parameter', unit: '' },
    ],
  },
  {
    id: 'sp-angle-between-vectors',
    subject: 'specialist',
    topic: 'Vectors',
    name: 'Angle between two vectors',
    formula: 'cos θ = (a·b) / (|a||b|)',
    description: 'Finds the angle between two vectors.',
    variables: [
      { name: 'a, b', meaning: 'vectors', unit: '' },
      { name: 'θ', meaning: 'angle between the vectors', unit: 'radians' },
    ],
  },
  {
    id: 'sp-kinematics-defs',
    subject: 'specialist',
    topic: 'Kinematics & Mechanics',
    name: 'Velocity and acceleration',
    formula: 'v = dr/dt,  a = dv/dt = d²r/dt²',
    description: 'Vector velocity and acceleration from the position vector.',
    variables: [
      { name: 'r', meaning: 'position vector', unit: 'm' },
      { name: 'v', meaning: 'velocity', unit: 'm/s' },
      { name: 'a', meaning: 'acceleration', unit: 'm/s²' },
      { name: 't', meaning: 'time', unit: 's' },
    ],
  },
  {
    id: 'sp-constant-acceleration',
    subject: 'specialist',
    topic: 'Kinematics & Mechanics',
    name: 'Constant acceleration equations',
    formula: 'v = u + a·t,  s = u·t + ½·a·t²,  v² = u² + 2·a·s',
    description: 'Motion under uniform acceleration.',
    variables: [
      { name: 's', meaning: 'displacement', unit: 'm' },
      { name: 'u', meaning: 'initial velocity', unit: 'm/s' },
      { name: 'v', meaning: 'final velocity', unit: 'm/s' },
      { name: 'a', meaning: 'acceleration', unit: 'm/s²' },
      { name: 't', meaning: 'time', unit: 's' },
    ],
  },
  {
    id: 'sp-newton-2nd',
    subject: 'specialist',
    topic: 'Kinematics & Mechanics',
    name: 'Newton\u2019s second law',
    formula: 'F = m·a',
    description: 'Force equals mass times acceleration.',
    variables: [
      { name: 'F', meaning: 'net force', unit: 'N' },
      { name: 'm', meaning: 'mass', unit: 'kg' },
      { name: 'a', meaning: 'acceleration', unit: 'm/s²' },
    ],
  },
  {
    id: 'sp-friction',
    subject: 'specialist',
    topic: 'Kinematics & Mechanics',
    name: 'Friction',
    formula: 'F ≤ μ·N',
    description: 'Maximum static friction from the normal reaction.',
    variables: [
      { name: 'F', meaning: 'friction force', unit: 'N' },
      { name: 'μ', meaning: 'coefficient of friction', unit: '' },
      { name: 'N', meaning: 'normal reaction', unit: 'N' },
    ],
  },
  {
    id: 'sp-work',
    subject: 'specialist',
    topic: 'Kinematics & Mechanics',
    name: 'Work done by a force',
    formula: 'W = F·d = |F||d|cos θ',
    description: 'Work is the dot product of force and displacement.',
    variables: [
      { name: 'W', meaning: 'work', unit: 'J' },
      { name: 'F', meaning: 'force', unit: 'N' },
      { name: 'd', meaning: 'displacement', unit: 'm' },
      { name: 'θ', meaning: 'angle between force and displacement', unit: 'radians' },
    ],
  },
  {
    id: 'sp-kinetic-energy',
    subject: 'specialist',
    topic: 'Kinematics & Mechanics',
    name: 'Kinetic energy',
    formula: 'KE = ½·m·v²',
    description: 'Energy of a moving object.',
    variables: [
      { name: 'KE', meaning: 'kinetic energy', unit: 'J' },
      { name: 'm', meaning: 'mass', unit: 'kg' },
      { name: 'v', meaning: 'speed', unit: 'm/s' },
    ],
  },
  {
    id: 'sp-circular-motion',
    subject: 'specialist',
    topic: 'Kinematics & Mechanics',
    name: 'Uniform circular motion',
    formula: 'a = v²/r = r·ω²,  F = m·v²/r',
    description: 'Centripetal acceleration and the force required for circular motion.',
    variables: [
      { name: 'a', meaning: 'centripetal acceleration', unit: 'm/s²' },
      { name: 'v', meaning: 'speed', unit: 'm/s' },
      { name: 'r', meaning: 'radius', unit: 'm' },
      { name: 'ω', meaning: 'angular velocity', unit: 'rad/s' },
      { name: 'm', meaning: 'mass', unit: 'kg' },
      { name: 'F', meaning: 'centripetal force', unit: 'N' },
    ],
  },
  {
    id: 'sp-separable-de',
    subject: 'specialist',
    topic: 'Differential Equations',
    name: 'Separable differential equation',
    formula: 'dy/dx = f(x)·g(y)  ⇒  ∫ 1/g(y) dy = ∫ f(x) dx',
    description: 'Technique for solving separable first-order differential equations.',
    variables: [
      { name: 'x, y', meaning: 'variables', unit: '' },
      { name: 'f, g', meaning: 'functions', unit: '' },
    ],
  },
  {
    id: 'sp-cooling',
    subject: 'specialist',
    topic: 'Differential Equations',
    name: 'Newton\u2019s law of cooling',
    formula: 'dT/dt = −k·(T − T_env)',
    description: 'Rate of cooling proportional to the temperature difference.',
    variables: [
      { name: 'T', meaning: 'object temperature', unit: 'K' },
      { name: 'T_env', meaning: 'environment temperature', unit: 'K' },
      { name: 'k', meaning: 'cooling constant (k > 0)', unit: '' },
      { name: 't', meaning: 'time', unit: 's' },
    ],
  },
  {
    id: 'sp-shm',
    subject: 'specialist',
    topic: 'Differential Equations',
    name: 'Simple harmonic motion',
    formula: 'd²x/dt² = −ω²·x',
    description: 'Equation of motion for simple harmonic motion.',
    variables: [
      { name: 'x', meaning: 'displacement', unit: 'm' },
      { name: 'ω', meaning: 'angular frequency', unit: 'rad/s' },
      { name: 't', meaning: 'time', unit: 's' },
    ],
  },
  {
    id: 'sp-sin-sum',
    subject: 'specialist',
    topic: 'Trigonometry',
    name: 'Sine sum and difference',
    formula: 'sin(A ± B) = sin A·cos B ± cos A·sin B',
    description: 'Expands the sine of a sum or difference.',
    variables: [{ name: 'A, B', meaning: 'angles', unit: 'radians' }],
  },
  {
    id: 'sp-cos-sum',
    subject: 'specialist',
    topic: 'Trigonometry',
    name: 'Cosine sum and difference',
    formula: 'cos(A ± B) = cos A·cos B ∓ sin A·sin B',
    description: 'Expands the cosine of a sum or difference.',
    variables: [{ name: 'A, B', meaning: 'angles', unit: 'radians' }],
  },
  {
    id: 'sp-tan-sum',
    subject: 'specialist',
    topic: 'Trigonometry',
    name: 'Tangent sum and difference',
    formula: 'tan(A ± B) = (tan A ± tan B) / (1 ∓ tan A·tan B)',
    description: 'Expands the tangent of a sum or difference.',
    variables: [{ name: 'A, B', meaning: 'angles', unit: 'radians' }],
  },
  {
    id: 'sp-double-angle',
    subject: 'specialist',
    topic: 'Trigonometry',
    name: 'Double angle formulas',
    formula: 'sin(2A) = 2·sin A·cos A,  cos(2A) = cos²A − sin²A = 2·cos²A − 1 = 1 − 2·sin²A',
    description: 'Sums of a function with itself.',
    variables: [{ name: 'A', meaning: 'angle', unit: 'radians' }],
  },
  {
    id: 'sp-a-sin-plus-b-cos',
    subject: 'specialist',
    topic: 'Trigonometry',
    name: 'a·sin x + b·cos x',
    formula: 'a·sin x + b·cos x = R·sin(x + α),  R = √(a² + b²),  tan α = b/a',
    description: 'Combines a sine and cosine into a single sine wave.',
    variables: [
      { name: 'a, b', meaning: 'constants', unit: '' },
      { name: 'R', meaning: 'amplitude √(a² + b²)', unit: '' },
      { name: 'α', meaning: 'phase shift', unit: 'radians' },
    ],
  },
  {
    id: 'sp-integration-by-parts',
    subject: 'specialist',
    topic: 'Calculus Techniques',
    name: 'Integration by parts',
    formula: '∫ u dv = u·v − ∫ v du',
    description: 'Reverses the product rule for products of functions.',
    variables: [{ name: 'u, v', meaning: 'functions of x', unit: '' }],
  },
  {
    id: 'sp-integration-by-substitution',
    subject: 'specialist',
    topic: 'Calculus Techniques',
    name: 'Integration by substitution',
    formula: '∫ f(g(x))·g′(x) dx = ∫ f(u) du,  u = g(x)',
    description: 'Reverses the chain rule.',
    variables: [
      { name: 'u', meaning: 'substitution u = g(x)', unit: '' },
      { name: 'g′, f', meaning: 'functions', unit: '' },
    ],
  },
  {
    id: 'sp-standard-integrals',
    subject: 'specialist',
    topic: 'Calculus Techniques',
    name: 'Standard inverse trig integrals',
    formula: '∫ 1/√(1 − x²) dx = sin⁻¹x + c,  ∫ 1/(1 + x²) dx = tan⁻¹x + c',
    description: 'Antiderivatives leading to inverse trigonometric functions.',
    variables: [{ name: 'c', meaning: 'constant of integration', unit: '' }],
  },
  {
    id: 'sp-volume-revolution',
    subject: 'specialist',
    topic: 'Calculus Techniques',
    name: 'Volume of revolution (about x-axis)',
    formula: 'V = π·∫ₐᵇ [f(x)]² dx',
    description: 'Volume swept out when the region under f is rotated about the x-axis.',
    variables: [
      { name: 'V', meaning: 'volume', unit: 'units³' },
      { name: 'f(x)', meaning: 'curve', unit: '' },
      { name: 'a, b', meaning: 'limits of integration', unit: '' },
    ],
  },
  {
    id: 'sp-arc-length',
    subject: 'specialist',
    topic: 'Calculus Techniques',
    name: 'Arc length',
    formula: 'L = ∫ₐᵇ √(1 + (dy/dx)²) dx',
    description: 'Length of a curve y = f(x) between x = a and x = b.',
    variables: [
      { name: 'L', meaning: 'arc length', unit: 'units' },
      { name: 'dy/dx', meaning: 'derivative of the curve', unit: '' },
      { name: 'a, b', meaning: 'limits of integration', unit: '' },
    ],
  },
];

export function useMathsFormulas() {
  const [subject, setSubject] = useState<SubjectKey | 'all'>('all');
  const [topic, setTopic] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const selectSubject = useCallback((next: SubjectKey | 'all') => {
    setSubject(next);
    setTopic('all');
  }, []);

  const topics = useMemo(() => {
    const pool = subject === 'all' ? (Object.keys(TOPIC_ORDER) as SubjectKey[]) : [subject];
    return pool.flatMap((s) => TOPIC_ORDER[s]);
  }, [subject]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return FORMULAS.filter((f) => {
      if (subject !== 'all' && f.subject !== subject) return false;
      if (topic !== 'all' && f.topic !== topic) return false;
      if (term) {
        const haystack = `${f.name} ${f.formula} ${f.description} ${f.topic} ${f.variables
          .map((v) => `${v.name} ${v.meaning}`)
          .join(' ')}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [subject, topic, search]);

  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return {
    subject,
    selectSubject,
    topic,
    setTopic,
    search,
    setSearch,
    topics,
    filtered,
    expanded,
    toggleExpanded,
    total: FORMULAS.length,
  };
}

export default function MathsFormulasPage() {
  const {
    subject,
    selectSubject,
    topic,
    setTopic,
    search,
    setSearch,
    topics,
    filtered,
    expanded,
    toggleExpanded,
    total,
  } = useMathsFormulas();

  const subjectChip = (key: SubjectKey): string => {
    const palette: Record<SubjectKey, string> = {
      general: 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200',
      methods: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200',
      specialist: 'bg-violet-50 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200',
    };
    return palette[key];
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
              VCE Mathematics Formulas
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {total} formulas across General Mathematics, Mathematical Methods and Specialist Mathematics.
            </p>
          </div>
        </nav>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search formulas, variables, topics…"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              aria-label="Search formulas"
            />
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              aria-label="Filter by topic"
            >
              <option value="all">All topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectSubject('all')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                subject === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              aria-pressed={subject === 'all'}
            >
              All subjects
            </button>
            {(Object.keys(SUBJECT_LABELS) as SubjectKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => selectSubject(key)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  subject === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-pressed={subject === key}
              >
                {SUBJECT_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} formula{filtered.length === 1 ? '' : 's'}
          {filtered.length > 0 && ' found'}
        </p>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">No formulas match your filters. Try a different search.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((formula) => {
            const isOpen = expanded.has(formula.id);
            return (
              <article
                key={formula.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${subjectChip(formula.subject)}`}>
                        {SUBJECT_LABELS[formula.subject]}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {formula.topic}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{formula.name}</h3>
                    <p className="mt-2 font-mono text-sm text-blue-700 dark:text-blue-300">{formula.formula}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(formula.id)}
                    className="shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${formula.name}`}
                  >
                    <svg
                      className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formula.description}</p>
                    {formula.variables.length > 0 && (
                      <dl className="mt-3 space-y-1">
                        {formula.variables.map((v) => (
                          <div key={v.name} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                            <dt className="w-40 shrink-0 font-mono text-xs text-gray-900 dark:text-white">{v.name}</dt>
                            <dd className="text-xs text-gray-600 dark:text-gray-400">
                              {v.meaning}
                              {v.unit ? ` (${v.unit})` : ''}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <p className="mt-8 rounded-md bg-gray-100 p-4 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          Formulas are presented as structured educational reference data based on the VCAA VCE Mathematics study
          designs. Always check the official VCAA formula sheet for your exam.
        </p>
      </div>
    </div>
  );
}
