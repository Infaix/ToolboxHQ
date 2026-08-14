// ATAR estimation engine.
//
// IMPORTANT: These are ESTIMATES only. A real ATAR depends on:
//  - VCAA subject scaling (published annually for each study)
//  - the VTAC aggregate formula (primary four + 10% of fifth/sixth)
//  - the annual aggregate-to-ATAR distribution table published by VTAC
//
// This module deliberately separates the *model* (aggregate formula,
// scaling and aggregate->ATAR mapping) from the presentation layer so the
// data tables below can be replaced with official VCAA/VTAC data without
// touching any UI code.

export interface SubjectScore {
  name: string;
  studyScore: number | null;
}

export const MIN_SCORE = 0;
export const MAX_SCORE = 50;

export const ENGLISH_PATTERN = /english/i;

// ---------------------------------------------------------------------------
// Study score scaling
// ---------------------------------------------------------------------------
// VTAC scales study scores separately for each VCE study using VCAA's annual
// scaling data. We do NOT include official scaling data here (it changes each
// year). The identity function below is used as a transparent approximation:
// scaled score is treated as equal to the raw study score.
//
// To use real scaling data, replace this with a lookup such as:
//   const SCALING: Record<string, (raw: number) => number> = { 'Maths': ..., ... }
// and call `scaleStudyScore(raw, name)` with the subject name.

export function scaleStudyScore(raw: number, _subjectName?: string): number {
  return raw;
}

// ---------------------------------------------------------------------------
// VTAC aggregate
// ---------------------------------------------------------------------------
// The VTAC aggregate is the sum of:
//   - the highest scaled score in an eligible English subject (if one exists)
//   - the next three highest scaled scores
//   - 10% of the fifth and sixth best scaled scores
// Aggregates are rounded to the nearest integer.

export function computeAggregate(subjects: SubjectScore[]): number {
  const scaled = subjects
    .filter((s) => s.studyScore !== null)
    .map((s) => ({ name: s.name, scaled: scaleStudyScore(s.studyScore as number, s.name) }))
    .sort((a, b) => b.scaled - a.scaled);

  if (scaled.length === 0) return 0;

  const english = scaled.filter((s) => ENGLISH_PATTERN.test(s.name));
  const others = scaled.filter((s) => !ENGLISH_PATTERN.test(s.name));

  let primary: number[];
  if (english.length > 0) {
    const bestEnglish = english[0];
    const bestOthers = others.slice(0, 3);
    primary = [bestEnglish, ...bestOthers].map((s) => s.scaled);
  } else {
    primary = scaled.slice(0, 4).map((s) => s.scaled);
  }

  const remaining = scaled.slice(primary.length).slice(0, 2);
  const aggregate = primary.reduce((sum, v) => sum + v, 0) + remaining.reduce((sum, v) => sum + 0.1 * v.scaled, 0);

  return Math.round(aggregate);
}

export function computeAverageScore(subjects: SubjectScore[]): number {
  const valid = subjects.filter((s) => s.studyScore !== null);
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, s) => acc + (s.studyScore as number), 0);
  return sum / valid.length;
}

export function hasAnyScore(subjects: SubjectScore[]): boolean {
  return subjects.some((s) => s.studyScore !== null);
}

export function getInvalidScores(subjects: SubjectScore[]): string[] {
  return subjects
    .filter((s) => s.studyScore !== null && (s.studyScore < MIN_SCORE || s.studyScore > MAX_SCORE))
    .map((s) => s.name);
}

// ---------------------------------------------------------------------------
// Aggregate -> ATAR mapping
// ---------------------------------------------------------------------------
// Approximate anchor points derived from typical published VCE distributions.
// This is a rough, indicative mapping ONLY. Replace this table with VTAC's
// official aggregate-to-ATAR lookup for a given year to get precise results.

export const AGGREGATE_TO_ATAR_POINTS: ReadonlyArray<{ aggregate: number; atar: number }> = [
  { aggregate: 0, atar: 0 },
  { aggregate: 100, atar: 30 },
  { aggregate: 110, atar: 38 },
  { aggregate: 120, atar: 46 },
  { aggregate: 130, atar: 56 },
  { aggregate: 140, atar: 67 },
  { aggregate: 150, atar: 77 },
  { aggregate: 160, atar: 86 },
  { aggregate: 170, atar: 93 },
  { aggregate: 180, atar: 97 },
  { aggregate: 190, atar: 99 },
  { aggregate: 200, atar: 99.95 },
];

export function estimateAtarFromAggregate(aggregate: number): number {
  return interpolate(aggregate, AGGREGATE_TO_ATAR_POINTS, 'aggregate', 'atar');
}

export function requiredAggregateForAtar(targetAtar: number): number {
  return interpolate(targetAtar, AGGREGATE_TO_ATAR_POINTS, 'atar', 'aggregate');
}

function interpolate(
  input: number,
  points: ReadonlyArray<{ aggregate: number; atar: number }>,
  fromKey: 'aggregate' | 'atar',
  toKey: 'aggregate' | 'atar'
): number {
  const sorted = [...points].sort((a, b) => a[fromKey] - b[fromKey]);

  if (input <= sorted[0][fromKey]) return sorted[0][toKey];
  const last = sorted[sorted.length - 1];
  if (input >= last[fromKey]) return last[toKey];

  for (let i = 0; i < sorted.length - 1; i++) {
    const lower = sorted[i];
    const upper = sorted[i + 1];
    if (input >= lower[fromKey] && input <= upper[fromKey]) {
      if (upper[fromKey] === lower[fromKey]) return lower[toKey];
      const ratio = (input - lower[fromKey]) / (upper[fromKey] - lower[fromKey]);
      return lower[toKey] + ratio * (upper[toKey] - lower[toKey]);
    }
  }

  return last[toKey];
}

// ---------------------------------------------------------------------------
// Goal analysis
// ---------------------------------------------------------------------------
// Estimates the average raw study score required to reach a target ATAR,
// assuming the student's scores are roughly uniform across their subjects.

export interface GoalAnalysis {
  currentAggregate: number;
  currentAtar: number;
  targetAggregate: number;
  requiredAverage: number;
  gapAggregate: number;
  onTrack: boolean;
}

export function analyzeGoal(subjects: SubjectScore[], targetAtar: number): GoalAnalysis {
  const currentAggregate = computeAggregate(subjects);
  const currentAtar = estimateAtarFromAggregate(currentAggregate);
  const targetAggregate = requiredAggregateForAtar(targetAtar);
  const count = subjects.filter((s) => s.studyScore !== null).length;

  let requiredAverage = 0;
  if (count > 0) {
    const denominator = count <= 4 ? count : 4 + 0.1 * (count - 4);
    requiredAverage = targetAggregate / denominator;
  }

  return {
    currentAggregate,
    currentAtar,
    targetAggregate,
    requiredAverage,
    gapAggregate: targetAggregate - currentAggregate,
    onTrack: currentAggregate >= targetAggregate,
  };
}
