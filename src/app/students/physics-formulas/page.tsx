"use client";

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import CopyButton from '@/components/tools/CopyButton';

type PhysicsTopic =
  | 'motion'
  | 'forces'
  | 'energy'
  | 'momentum'
  | 'gravitation'
  | 'circular-motion'
  | 'relativity'
  | 'electricity'
  | 'fields'
  | 'electromagnetism'
  | 'waves'
  | 'light'
  | 'quantum';

interface PhysicsVariable {
  name: string;
  meaning: string;
  unit: string;
  defaultValue?: number;
}

interface PhysicsFormula {
  id: string;
  topic: PhysicsTopic;
  name: string;
  formula: string;
  description: string;
  variables: PhysicsVariable[];
  calculatorSlug?: string;
}

const TOPIC_ORDER: PhysicsTopic[] = [
  'motion',
  'forces',
  'energy',
  'momentum',
  'gravitation',
  'circular-motion',
  'relativity',
  'electricity',
  'fields',
  'electromagnetism',
  'waves',
  'light',
  'quantum',
];

const TOPIC_LABELS: Record<PhysicsTopic, string> = {
  motion: 'Motion',
  forces: 'Forces',
  energy: 'Energy',
  momentum: 'Momentum',
  gravitation: 'Gravitation',
  'circular-motion': 'Circular Motion',
  relativity: 'Relativity',
  electricity: 'Electricity',
  fields: 'Fields',
  electromagnetism: 'Electromagnetism',
  waves: 'Waves',
  light: 'Light',
  quantum: 'Quantum Physics',
};

// Structured educational data based on the VCAA VCE Physics formula sheet and
// the current VCE Physics study design. Presented as data (not a copy of the
// official PDF) so it can be searched, filtered and linked to calculators.
const FORMULAS: PhysicsFormula[] = [
  {
    id: 'motion-velocity-1',
    topic: 'motion',
    name: 'Velocity (uniform acceleration)',
    formula: 'v = u + a·t',
    description: 'Final velocity after accelerating uniformly for time t.',
    variables: [
      { name: 'v', meaning: 'final velocity', unit: 'm/s' },
      { name: 'u', meaning: 'initial velocity', unit: 'm/s' },
      { name: 'a', meaning: 'acceleration', unit: 'm/s²' },
      { name: 't', meaning: 'time', unit: 's' },
    ],
    calculatorSlug: 'acceleration',
  },
  {
    id: 'motion-displacement',
    topic: 'motion',
    name: 'Displacement (uniform acceleration)',
    formula: 's = u·t + ½·a·t²',
    description: 'Displacement after accelerating uniformly for time t.',
    variables: [
      { name: 's', meaning: 'displacement', unit: 'm' },
      { name: 'u', meaning: 'initial velocity', unit: 'm/s' },
      { name: 'a', meaning: 'acceleration', unit: 'm/s²' },
      { name: 't', meaning: 'time', unit: 's' },
    ],
  },
  {
    id: 'motion-velocity-2',
    topic: 'motion',
    name: 'Velocity\u2013displacement relation',
    formula: 'v² = u² + 2·a·s',
    description: 'Relates velocity, acceleration and displacement without time.',
    variables: [
      { name: 'v', meaning: 'final velocity', unit: 'm/s' },
      { name: 'u', meaning: 'initial velocity', unit: 'm/s' },
      { name: 'a', meaning: 'acceleration', unit: 'm/s²' },
      { name: 's', meaning: 'displacement', unit: 'm' },
    ],
  },
  {
    id: 'motion-average',
    topic: 'motion',
    name: 'Average velocity',
    formula: 's = ½·(u + v)·t',
    description: 'Displacement using the average of initial and final velocity.',
    variables: [
      { name: 's', meaning: 'displacement', unit: 'm' },
      { name: 'u', meaning: 'initial velocity', unit: 'm/s' },
      { name: 'v', meaning: 'final velocity', unit: 'm/s' },
      { name: 't', meaning: 'time', unit: 's' },
    ],
  },
  {
    id: 'motion-speed',
    topic: 'motion',
    name: 'Speed',
    formula: 'v = d / t',
    description: 'Average speed is distance divided by time.',
    variables: [
      { name: 'v', meaning: 'speed', unit: 'm/s' },
      { name: 'd', meaning: 'distance', unit: 'm' },
      { name: 't', meaning: 'time', unit: 's' },
    ],
    calculatorSlug: 'speed',
  },
  {
    id: 'motion-acceleration',
    topic: 'motion',
    name: 'Acceleration',
    formula: 'a = (v − u) / t',
    description: 'Rate of change of velocity.',
    variables: [
      { name: 'a', meaning: 'acceleration', unit: 'm/s²' },
      { name: 'v', meaning: 'final velocity', unit: 'm/s' },
      { name: 'u', meaning: 'initial velocity', unit: 'm/s' },
      { name: 't', meaning: 'time', unit: 's' },
    ],
    calculatorSlug: 'acceleration',
  },

  {
    id: 'forces-newton-2',
    topic: 'forces',
    name: 'Newton\u2019s second law',
    formula: 'F = m·a',
    description: 'Net force equals mass times acceleration.',
    variables: [
      { name: 'F', meaning: 'net force', unit: 'N' },
      { name: 'm', meaning: 'mass', unit: 'kg' },
      { name: 'a', meaning: 'acceleration', unit: 'm/s²' },
    ],
    calculatorSlug: 'force',
  },
  {
    id: 'forces-weight',
    topic: 'forces',
    name: 'Weight',
    formula: 'W = m·g',
    description: 'Force of gravity on a mass near Earth\u2019s surface.',
    variables: [
      { name: 'W', meaning: 'weight', unit: 'N' },
      { name: 'm', meaning: 'mass', unit: 'kg' },
      { name: 'g', meaning: 'gravitational field strength', unit: 'N/kg', defaultValue: 9.8 },
    ],
    calculatorSlug: 'weight',
  },
  {
    id: 'forces-friction',
    topic: 'forces',
    name: 'Friction',
    formula: 'F = μ·N',
    description: 'Friction force from the coefficient of friction and normal reaction.',
    variables: [
      { name: 'F', meaning: 'friction force', unit: 'N' },
      { name: 'μ', meaning: 'coefficient of friction', unit: '' },
      { name: 'N', meaning: 'normal reaction', unit: 'N' },
    ],
  },
  {
    id: 'forces-hooke',
    topic: 'forces',
    name: 'Hooke\u2019s law',
    formula: 'F = k·x',
    description: 'Restoring force of a spring proportional to its extension.',
    variables: [
      { name: 'F', meaning: 'force', unit: 'N' },
      { name: 'k', meaning: 'spring constant', unit: 'N/m' },
      { name: 'x', meaning: 'extension or compression', unit: 'm' },
    ],
  },

  {
    id: 'energy-kinetic',
    topic: 'energy',
    name: 'Kinetic energy',
    formula: 'KE = ½·m·v²',
    description: 'Energy of an object due to its motion.',
    variables: [
      { name: 'KE', meaning: 'kinetic energy', unit: 'J' },
      { name: 'm', meaning: 'mass', unit: 'kg' },
      { name: 'v', meaning: 'speed', unit: 'm/s' },
    ],
    calculatorSlug: 'kinetic-energy',
  },
  {
    id: 'energy-gpe',
    topic: 'energy',
    name: 'Gravitational potential energy',
    formula: 'GPE = m·g·h',
    description: 'Energy of an object due to its height above a reference point.',
    variables: [
      { name: 'GPE', meaning: 'gravitational potential energy', unit: 'J' },
      { name: 'm', meaning: 'mass', unit: 'kg' },
      { name: 'g', meaning: 'gravitational field strength', unit: 'N/kg', defaultValue: 9.8 },
      { name: 'h', meaning: 'height', unit: 'm' },
    ],
    calculatorSlug: 'gpe',
  },
  {
    id: 'energy-work',
    topic: 'energy',
    name: 'Work',
    formula: 'W = F·d',
    description: 'Work done by a constant force along the direction of motion.',
    variables: [
      { name: 'W', meaning: 'work', unit: 'J' },
      { name: 'F', meaning: 'force', unit: 'N' },
      { name: 'd', meaning: 'displacement', unit: 'm' },
    ],
    calculatorSlug: 'work',
  },
  {
    id: 'energy-power',
    topic: 'energy',
    name: 'Power',
    formula: 'P = W / t = F·v',
    description: 'Rate at which work is done.',
    variables: [
      { name: 'P', meaning: 'power', unit: 'W' },
      { name: 'W', meaning: 'work', unit: 'J' },
      { name: 't', meaning: 'time', unit: 's' },
      { name: 'F', meaning: 'force', unit: 'N' },
      { name: 'v', meaning: 'velocity', unit: 'm/s' },
    ],
    calculatorSlug: 'power',
  },
  {
    id: 'energy-elastic',
    topic: 'energy',
    name: 'Elastic potential energy',
    formula: 'E = ½·k·x²',
    description: 'Energy stored in a stretched or compressed spring.',
    variables: [
      { name: 'E', meaning: 'elastic potential energy', unit: 'J' },
      { name: 'k', meaning: 'spring constant', unit: 'N/m' },
      { name: 'x', meaning: 'extension or compression', unit: 'm' },
    ],
  },
  {
    id: 'energy-efficiency',
    topic: 'energy',
    name: 'Efficiency',
    formula: 'η = (useful energy out / total energy in) × 100%',
    description: 'Useful output as a percentage of total input.',
    variables: [
      { name: 'η', meaning: 'efficiency', unit: '%' },
    ],
  },

  {
    id: 'momentum-momentum',
    topic: 'momentum',
    name: 'Momentum',
    formula: 'p = m·v',
    description: 'Product of mass and velocity.',
    variables: [
      { name: 'p', meaning: 'momentum', unit: 'kg·m/s' },
      { name: 'm', meaning: 'mass', unit: 'kg' },
      { name: 'v', meaning: 'velocity', unit: 'm/s' },
    ],
    calculatorSlug: 'momentum',
  },
  {
    id: 'momentum-impulse',
    topic: 'momentum',
    name: 'Impulse',
    formula: 'Impulse = F·Δt = m·v − m·u',
    description: 'Change in momentum is equal to the net force times the time of action.',
    variables: [
      { name: 'F', meaning: 'net force', unit: 'N' },
      { name: 'Δt', meaning: 'time interval', unit: 's' },
      { name: 'm', meaning: 'mass', unit: 'kg' },
      { name: 'v', meaning: 'final velocity', unit: 'm/s' },
      { name: 'u', meaning: 'initial velocity', unit: 'm/s' },
    ],
  },
  {
    id: 'momentum-conservation',
    topic: 'momentum',
    name: 'Conservation of momentum',
    formula: 'm₁u₁ + m₂u₂ = m₁v₁ + m₂v₂',
    description: 'Total momentum before a collision equals total momentum after (no external forces).',
    variables: [
      { name: 'm₁, m₂', meaning: 'masses', unit: 'kg' },
      { name: 'u₁, u₂', meaning: 'initial velocities', unit: 'm/s' },
      { name: 'v₁, v₂', meaning: 'final velocities', unit: 'm/s' },
    ],
  },

  {
    id: 'gravitation-inverse-square',
    topic: 'gravitation',
    name: 'Newton\u2019s law of universal gravitation',
    formula: 'F = G·m₁·m₂ / r²',
    description: 'Gravitational force between two masses.',
    variables: [
      { name: 'F', meaning: 'gravitational force', unit: 'N' },
      { name: 'G', meaning: 'universal gravitational constant', unit: 'N·m²/kg²' },
      { name: 'm₁, m₂', meaning: 'masses', unit: 'kg' },
      { name: 'r', meaning: 'distance between centres', unit: 'm' },
    ],
  },
  {
    id: 'gravitation-field',
    topic: 'gravitation',
    name: 'Gravitational field strength',
    formula: 'g = G·M / r²',
    description: 'Gravitational field strength at distance r from mass M.',
    variables: [
      { name: 'g', meaning: 'gravitational field strength', unit: 'N/kg' },
      { name: 'G', meaning: 'universal gravitational constant', unit: 'N·m²/kg²' },
      { name: 'M', meaning: 'central mass', unit: 'kg' },
      { name: 'r', meaning: 'distance from centre of mass', unit: 'm' },
    ],
  },
  {
    id: 'gravitation-orbital-speed',
    topic: 'gravitation',
    name: 'Orbital speed',
    formula: 'v = √(G·M / r)',
    description: 'Speed of a body in a circular orbit at distance r from mass M.',
    variables: [
      { name: 'v', meaning: 'orbital speed', unit: 'm/s' },
      { name: 'G', meaning: 'universal gravitational constant', unit: 'N·m²/kg²' },
      { name: 'M', meaning: 'central mass', unit: 'kg' },
      { name: 'r', meaning: 'orbital radius', unit: 'm' },
    ],
  },
  {
    id: 'gravitation-period',
    topic: 'gravitation',
    name: 'Orbital period',
    formula: 'T = 2·π·r / v',
    description: 'Period of uniform circular orbital motion.',
    variables: [
      { name: 'T', meaning: 'orbital period', unit: 's' },
      { name: 'r', meaning: 'orbital radius', unit: 'm' },
      { name: 'v', meaning: 'orbital speed', unit: 'm/s' },
    ],
  },

  {
    id: 'circular-centripetal-acceleration',
    topic: 'circular-motion',
    name: 'Centripetal acceleration',
    formula: 'a = v² / r = r·ω²',
    description: 'Acceleration towards the centre of a circular path.',
    variables: [
      { name: 'a', meaning: 'centripetal acceleration', unit: 'm/s²' },
      { name: 'v', meaning: 'speed', unit: 'm/s' },
      { name: 'r', meaning: 'radius', unit: 'm' },
      { name: 'ω', meaning: 'angular velocity', unit: 'rad/s' },
    ],
  },
  {
    id: 'circular-centripetal-force',
    topic: 'circular-motion',
    name: 'Centripetal force',
    formula: 'F = m·v² / r = m·r·ω²',
    description: 'Force required to keep a mass moving in a circle.',
    variables: [
      { name: 'F', meaning: 'centripetal force', unit: 'N' },
      { name: 'm', meaning: 'mass', unit: 'kg' },
      { name: 'v', meaning: 'speed', unit: 'm/s' },
      { name: 'r', meaning: 'radius', unit: 'm' },
      { name: 'ω', meaning: 'angular velocity', unit: 'rad/s' },
    ],
  },
  {
    id: 'circular-angular-velocity',
    topic: 'circular-motion',
    name: 'Angular velocity',
    formula: 'ω = 2·π / T',
    description: 'Angle swept per second for a period T.',
    variables: [
      { name: 'ω', meaning: 'angular velocity', unit: 'rad/s' },
      { name: 'T', meaning: 'period', unit: 's' },
    ],
  },

  {
    id: 'relativity-time-dilation',
    topic: 'relativity',
    name: 'Time dilation',
    formula: 't = t₀ / √(1 − v²/c²)',
    description: 'Proper time t₀ measured by a moving clock appears dilated.',
    variables: [
      { name: 't', meaning: 'time observed', unit: 's' },
      { name: 't₀', meaning: 'proper time (in the moving frame)', unit: 's' },
      { name: 'v', meaning: 'relative speed', unit: 'm/s' },
      { name: 'c', meaning: 'speed of light', unit: 'm/s' },
    ],
  },
  {
    id: 'relativity-length-contraction',
    topic: 'relativity',
    name: 'Length contraction',
    formula: 'L = L₀·√(1 − v²/c²)',
    description: 'A moving object appears shorter along its direction of motion.',
    variables: [
      { name: 'L', meaning: 'length observed', unit: 'm' },
      { name: 'L₀', meaning: 'proper length (at rest)', unit: 'm' },
      { name: 'v', meaning: 'relative speed', unit: 'm/s' },
      { name: 'c', meaning: 'speed of light', unit: 'm/s' },
    ],
  },
  {
    id: 'relativity-energy',
    topic: 'relativity',
    name: 'Mass\u2013energy equivalence',
    formula: 'E = m·c²',
    description: 'Energy equivalent of mass.',
    variables: [
      { name: 'E', meaning: 'energy', unit: 'J' },
      { name: 'm', meaning: 'mass', unit: 'kg' },
      { name: 'c', meaning: 'speed of light', unit: 'm/s' },
    ],
  },

  {
    id: 'electricity-ohms-law',
    topic: 'electricity',
    name: 'Ohm\u2019s law',
    formula: 'V = I·R',
    description: 'Voltage across a resistor is current times resistance.',
    variables: [
      { name: 'V', meaning: 'voltage', unit: 'V' },
      { name: 'I', meaning: 'current', unit: 'A' },
      { name: 'R', meaning: 'resistance', unit: 'Ω' },
    ],
    calculatorSlug: 'ohms-law',
  },
  {
    id: 'electricity-power',
    topic: 'electricity',
    name: 'Electrical power',
    formula: 'P = V·I = I²·R = V²/R',
    description: 'Power dissipated in an electric circuit.',
    variables: [
      { name: 'P', meaning: 'power', unit: 'W' },
      { name: 'V', meaning: 'voltage', unit: 'V' },
      { name: 'I', meaning: 'current', unit: 'A' },
      { name: 'R', meaning: 'resistance', unit: 'Ω' },
    ],
    calculatorSlug: 'electrical-power',
  },
  {
    id: 'electricity-energy',
    topic: 'electricity',
    name: 'Electrical energy',
    formula: 'E = P·t = V·I·t',
    description: 'Energy transferred by an electric circuit over time.',
    variables: [
      { name: 'E', meaning: 'energy', unit: 'J' },
      { name: 'P', meaning: 'power', unit: 'W' },
      { name: 't', meaning: 'time', unit: 's' },
      { name: 'V', meaning: 'voltage', unit: 'V' },
      { name: 'I', meaning: 'current', unit: 'A' },
    ],
  },
  {
    id: 'electricity-charge',
    topic: 'electricity',
    name: 'Charge',
    formula: 'Q = I·t',
    description: 'Charge passing a point is current times time.',
    variables: [
      { name: 'Q', meaning: 'charge', unit: 'C' },
      { name: 'I', meaning: 'current', unit: 'A' },
      { name: 't', meaning: 'time', unit: 's' },
    ],
  },
  {
    id: 'electricity-series',
    topic: 'electricity',
    name: 'Series resistance',
    formula: 'R = R₁ + R₂ + …',
    description: 'Total resistance of resistors in series.',
    variables: [
      { name: 'R', meaning: 'total resistance', unit: 'Ω' },
      { name: 'R₁, R₂, …', meaning: 'individual resistances', unit: 'Ω' },
    ],
  },
  {
    id: 'electricity-parallel',
    topic: 'electricity',
    name: 'Parallel resistance',
    formula: '1/R = 1/R₁ + 1/R₂ + …',
    description: 'Reciprocal of total resistance for resistors in parallel.',
    variables: [
      { name: 'R', meaning: 'total resistance', unit: 'Ω' },
      { name: 'R₁, R₂, …', meaning: 'individual resistances', unit: 'Ω' },
    ],
  },

  {
    id: 'fields-electric-field',
    topic: 'fields',
    name: 'Electric field strength',
    formula: 'E = F / q',
    description: 'Force per unit charge.',
    variables: [
      { name: 'E', meaning: 'electric field strength', unit: 'N/C' },
      { name: 'F', meaning: 'electric force', unit: 'N' },
      { name: 'q', meaning: 'charge', unit: 'C' },
    ],
  },
  {
    id: 'fields-uniform-field',
    topic: 'fields',
    name: 'Uniform electric field',
    formula: 'E = V / d',
    description: 'Field strength between parallel plates.',
    variables: [
      { name: 'E', meaning: 'electric field strength', unit: 'V/m' },
      { name: 'V', meaning: 'potential difference', unit: 'V' },
      { name: 'd', meaning: 'plate separation', unit: 'm' },
    ],
  },
  {
    id: 'fields-force-on-charge',
    topic: 'fields',
    name: 'Force on a charge',
    formula: 'F = q·E',
    description: 'Force experienced by a charge in an electric field.',
    variables: [
      { name: 'F', meaning: 'force', unit: 'N' },
      { name: 'q', meaning: 'charge', unit: 'C' },
      { name: 'E', meaning: 'electric field strength', unit: 'N/C' },
    ],
  },
  {
    id: 'fields-potential-energy',
    topic: 'fields',
    name: 'Electric potential energy',
    formula: 'PE = q·V',
    description: 'Potential energy of a charge at potential V.',
    variables: [
      { name: 'PE', meaning: 'electric potential energy', unit: 'J' },
      { name: 'q', meaning: 'charge', unit: 'C' },
      { name: 'V', meaning: 'electric potential', unit: 'V' },
    ],
  },

  {
    id: 'electromag-wire-force',
    topic: 'electromagnetism',
    name: 'Force on a current-carrying wire',
    formula: 'F = B·I·l·sin θ',
    description: 'Force on a length of wire carrying current in a magnetic field.',
    variables: [
      { name: 'F', meaning: 'force', unit: 'N' },
      { name: 'B', meaning: 'magnetic field strength', unit: 'T' },
      { name: 'I', meaning: 'current', unit: 'A' },
      { name: 'l', meaning: 'length of wire in field', unit: 'm' },
      { name: 'θ', meaning: 'angle between wire and field', unit: 'degrees' },
    ],
  },
  {
    id: 'electromag-charge-force',
    topic: 'electromagnetism',
    name: 'Force on a moving charge',
    formula: 'F = q·v·B·sin θ',
    description: 'Force on a charge moving through a magnetic field.',
    variables: [
      { name: 'F', meaning: 'force', unit: 'N' },
      { name: 'q', meaning: 'charge', unit: 'C' },
      { name: 'v', meaning: 'velocity', unit: 'm/s' },
      { name: 'B', meaning: 'magnetic field strength', unit: 'T' },
      { name: 'θ', meaning: 'angle between velocity and field', unit: 'degrees' },
    ],
  },
  {
    id: 'electromag-flux',
    topic: 'electromagnetism',
    name: 'Magnetic flux',
    formula: 'Φ = B·A·cos θ',
    description: 'Magnetic flux through an area A at angle θ to the field.',
    variables: [
      { name: 'Φ', meaning: 'magnetic flux', unit: 'Wb' },
      { name: 'B', meaning: 'magnetic field strength', unit: 'T' },
      { name: 'A', meaning: 'area', unit: 'm²' },
      { name: 'θ', meaning: 'angle between field and area normal', unit: 'degrees' },
    ],
  },
  {
    id: 'electromag-faraday',
    topic: 'electromagnetism',
    name: 'Faraday\u2019s law',
    formula: 'ε = −N·ΔΦ/Δt',
    description: 'Induced emf from a changing magnetic flux.',
    variables: [
      { name: 'ε', meaning: 'induced emf', unit: 'V' },
      { name: 'N', meaning: 'number of turns', unit: '' },
      { name: 'ΔΦ', meaning: 'change in magnetic flux', unit: 'Wb' },
      { name: 'Δt', meaning: 'time interval', unit: 's' },
    ],
  },
  {
    id: 'electromag-transformer',
    topic: 'electromagnetism',
    name: 'Ideal transformer',
    formula: 'Vₚ/Vₛ = Nₚ/Nₛ',
    description: 'Voltage ratio equals the turns ratio.',
    variables: [
      { name: 'Vₚ', meaning: 'primary voltage', unit: 'V' },
      { name: 'Vₛ', meaning: 'secondary voltage', unit: 'V' },
      { name: 'Nₚ', meaning: 'primary turns', unit: '' },
      { name: 'Nₛ', meaning: 'secondary turns', unit: '' },
    ],
  },

  {
    id: 'waves-speed',
    topic: 'waves',
    name: 'Wave speed',
    formula: 'v = f·λ',
    description: 'Wave speed is frequency times wavelength.',
    variables: [
      { name: 'v', meaning: 'wave speed', unit: 'm/s' },
      { name: 'f', meaning: 'frequency', unit: 'Hz' },
      { name: 'λ', meaning: 'wavelength', unit: 'm' },
    ],
    calculatorSlug: 'wave-speed',
  },
  {
    id: 'waves-period',
    topic: 'waves',
    name: 'Period',
    formula: 'T = 1 / f',
    description: 'Period is the reciprocal of frequency.',
    variables: [
      { name: 'T', meaning: 'period', unit: 's' },
      { name: 'f', meaning: 'frequency', unit: 'Hz' },
    ],
  },
  {
    id: 'waves-standing-string',
    topic: 'waves',
    name: 'Standing waves on a string',
    formula: 'fₙ = n·v / (2·L)',
    description: 'Harmonic frequencies of a string fixed at both ends.',
    variables: [
      { name: 'fₙ', meaning: 'frequency of the n-th harmonic', unit: 'Hz' },
      { name: 'n', meaning: 'harmonic number', unit: '' },
      { name: 'v', meaning: 'wave speed on the string', unit: 'm/s' },
      { name: 'L', meaning: 'length of string', unit: 'm' },
    ],
  },
  {
    id: 'waves-doppler',
    topic: 'waves',
    name: 'Doppler effect',
    formula: 'f′ = f·(v ± v₀) / (v ∓ vₛ)',
    description: 'Observed frequency when source and observer move relative to each other.',
    variables: [
      { name: 'f′', meaning: 'observed frequency', unit: 'Hz' },
      { name: 'f', meaning: 'source frequency', unit: 'Hz' },
      { name: 'v', meaning: 'wave speed', unit: 'm/s' },
      { name: 'v₀', meaning: 'observer speed', unit: 'm/s' },
      { name: 'vₛ', meaning: 'source speed', unit: 'm/s' },
    ],
  },

  {
    id: 'light-snell',
    topic: 'light',
    name: 'Snell\u2019s law (refraction)',
    formula: 'n₁·sin θ₁ = n₂·sin θ₂',
    description: 'Relates angles of incidence and refraction across a boundary.',
    variables: [
      { name: 'n₁, n₂', meaning: 'refractive indices', unit: '' },
      { name: 'θ₁', meaning: 'angle of incidence', unit: 'degrees' },
      { name: 'θ₂', meaning: 'angle of refraction', unit: 'degrees' },
    ],
  },
  {
    id: 'light-critical-angle',
    topic: 'light',
    name: 'Critical angle',
    formula: 'sin θ_c = n₂ / n₁',
    description: 'Angle above which total internal reflection occurs (n₁ > n₂).',
    variables: [
      { name: 'θ_c', meaning: 'critical angle', unit: 'degrees' },
      { name: 'n₁', meaning: 'refractive index of first medium', unit: '' },
      { name: 'n₂', meaning: 'refractive index of second medium', unit: '' },
    ],
  },
  {
    id: 'light-refractive-index',
    topic: 'light',
    name: 'Refractive index',
    formula: 'n = c / v',
    description: 'Ratio of the speed of light in a vacuum to its speed in the medium.',
    variables: [
      { name: 'n', meaning: 'refractive index', unit: '' },
      { name: 'c', meaning: 'speed of light in a vacuum', unit: 'm/s' },
      { name: 'v', meaning: 'speed of light in the medium', unit: 'm/s' },
    ],
  },

  {
    id: 'quantum-photon-energy',
    topic: 'quantum',
    name: 'Photon energy',
    formula: 'E = h·f = h·c/λ',
    description: 'Energy of a single photon.',
    variables: [
      { name: 'E', meaning: 'photon energy', unit: 'J' },
      { name: 'h', meaning: 'Planck constant', unit: 'J·s' },
      { name: 'f', meaning: 'frequency', unit: 'Hz' },
      { name: 'c', meaning: 'speed of light', unit: 'm/s' },
      { name: 'λ', meaning: 'wavelength', unit: 'm' },
    ],
  },
  {
    id: 'quantum-photoelectric',
    topic: 'quantum',
    name: 'Photoelectric effect',
    formula: 'KE_max = h·f − W',
    description: 'Maximum kinetic energy of emitted electrons.',
    variables: [
      { name: 'KE_max', meaning: 'maximum kinetic energy of photoelectrons', unit: 'J' },
      { name: 'h', meaning: 'Planck constant', unit: 'J·s' },
      { name: 'f', meaning: 'photon frequency', unit: 'Hz' },
      { name: 'W', meaning: 'work function of the metal', unit: 'J' },
    ],
  },
  {
    id: 'quantum-threshold',
    topic: 'quantum',
    name: 'Threshold frequency',
    formula: 'f₀ = W / h',
    description: 'Minimum frequency needed to eject an electron.',
    variables: [
      { name: 'f₀', meaning: 'threshold frequency', unit: 'Hz' },
      { name: 'W', meaning: 'work function', unit: 'J' },
      { name: 'h', meaning: 'Planck constant', unit: 'J·s' },
    ],
  },
  {
    id: 'quantum-de-broglie',
    topic: 'quantum',
    name: 'de Broglie wavelength',
    formula: 'λ = h / p = h / (m·v)',
    description: 'Wavelength associated with a moving particle.',
    variables: [
      { name: 'λ', meaning: 'de Broglie wavelength', unit: 'm' },
      { name: 'h', meaning: 'Planck constant', unit: 'J·s' },
      { name: 'p', meaning: 'momentum', unit: 'kg·m/s' },
      { name: 'm', meaning: 'mass', unit: 'kg' },
      { name: 'v', meaning: 'velocity', unit: 'm/s' },
    ],
  },
];

export function usePhysicsFormulas() {
  const [topic, setTopic] = useState<PhysicsTopic | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return FORMULAS.filter((f) => {
      if (topic !== 'all' && f.topic !== topic) return false;
      if (term) {
        const haystack = `${f.name} ${f.formula} ${f.description} ${TOPIC_LABELS[f.topic]} ${f.variables
          .map((v) => `${v.name} ${v.meaning} ${v.unit}`)
          .join(' ')}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [topic, search]);

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
    topic,
    setTopic,
    search,
    setSearch,
    filtered,
    expanded,
    toggleExpanded,
    total: FORMULAS.length,
  };
}

export default function PhysicsFormulasPage() {
  const { topic, setTopic, search, setSearch, filtered, expanded, toggleExpanded, total } =
    usePhysicsFormulas();

  const ghostButton =
    'inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700';

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
              VCE Physics Formulas
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {total} formulas covering the VCE Physics study design.
            </p>
          </div>
        </nav>

        <div className="mb-6 space-y-4">
          <div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search formulas, variables, units…"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              aria-label="Search physics formulas"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTopic('all')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                topic === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              aria-pressed={topic === 'all'}
            >
              All topics
            </button>
            {TOPIC_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTopic(key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  topic === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                aria-pressed={topic === key}
              >
                {TOPIC_LABELS[key]}
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
                  <div className="min-w-0">
                    <div className="mb-2">
                      <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/50 dark:text-sky-200">
                        {TOPIC_LABELS[formula.topic]}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{formula.name}</h3>
                    <p className="mt-2 break-words font-mono text-sm text-blue-700 dark:text-blue-300">
                      {formula.formula}
                    </p>
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
                      <dl className="mt-3 space-y-1.5">
                        {formula.variables.map((v) => (
                          <div key={v.name} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                            <dt className="w-44 shrink-0 font-mono text-xs text-gray-900 dark:text-white">
                              {v.name}
                              {typeof v.defaultValue === 'number' && (
                                <span className="ml-1 text-gray-400 dark:text-gray-500">({v.defaultValue})</span>
                              )}
                            </dt>
                            <dd className="text-xs text-gray-600 dark:text-gray-400">
                              {v.meaning} — <span className="font-medium">{v.unit}</span>
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <CopyButton text={formula.formula} label="Copy formula" />
                      {formula.calculatorSlug && (
                        <Link href={`/students/physics-calculator?formula=${formula.calculatorSlug}`} className={ghostButton}>
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="2" />
                            <path d="M8 6h8M8 11h8M8 16h8" />
                          </svg>
                          Open calculator
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <p className="mt-8 rounded-md bg-gray-100 p-4 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          Formulas are presented as structured educational reference data based on the VCAA VCE Physics formula sheet
          and study design. Always check the official VCAA formula sheet for your exam. The Physics Calculator solves a
          subset of these formulas.
        </p>
      </div>
    </div>
  );
}
