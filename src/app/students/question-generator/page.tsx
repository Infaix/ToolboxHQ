"use client";

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface QuestionTemplate {
  question: string;
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const questionTemplates: Record<string, QuestionTemplate[]> = {
  maths: [
    {
      question: 'What is the value of x in the equation 2x + 5 = 15?',
      answer: 'x = 5',
      explanation: 'Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5',
      difficulty: 'easy',
    },
    {
      question: 'Simplify (x³)²',
      answer: 'x⁶',
      explanation: 'Multiply the exponents: 3 × 2 = 6',
      difficulty: 'easy',
    },
    {
      question: 'Factorise x² + 5x + 6',
      answer: '(x + 2)(x + 3)',
      explanation: 'Find two numbers that multiply to 6 and add to 5: 2 and 3',
      difficulty: 'medium',
    },
    {
      question: 'Solve the quadratic equation x² - 5x + 6 = 0',
      answer: 'x = 2 or x = 3',
      explanation: 'Factorise to (x - 2)(x - 3) = 0, then each factor gives a solution',
      difficulty: 'medium',
    },
    {
      question: 'Find dy/dx for y = x³ - 4x² + 7x - 2',
      answer: 'dy/dx = 3x² - 8x + 7',
      explanation: 'Differentiate term by term: d/dx(x³) = 3x², d/dx(-4x²) = -8x, d/dx(7x) = 7, d/dx(-2) = 0',
      difficulty: 'hard',
    },
  ],

  physics: [
    {
      question: 'What is the formula for force?',
      answer: 'F = m × a',
      explanation: 'Newton\'s Second Law of Motion: force equals mass times acceleration',
      difficulty: 'easy',
    },
    {
      question: 'What is the kinetic energy formula?',
      answer: 'KE = 0.5 × m × v²',
      explanation: 'Kinetic energy depends on mass and the square of velocity',
      difficulty: 'easy',
    },
    {
      question: 'A 10 kg object is dropped from a height of 5 m. What is its gravitational potential energy? (g = 9.8 m/s²)',
      answer: 'GPE = m × g × h = 10 × 9.8 × 5 = 490 J',
      explanation: 'Gravitational potential energy equals mass times gravitational acceleration times height',
      difficulty: 'medium',
    },
    {
      question: 'Calculate the momentum of a 1200 kg car moving at 20 m/s',
      answer: 'p = m × v = 1200 × 20 = 24,000 kg·m/s',
      explanation: 'Momentum equals mass times velocity',
      difficulty: 'medium',
    },
    {
      question: 'A 0.5 kg ball moving at 8 m/s collides elastically with a stationary ball of the same mass. What is the final velocity of the first ball?',
      answer: '0 m/s',
      explanation: 'In a perfectly elastic collision between equal masses, the moving ball stops and transfers all its momentum',
      difficulty: 'hard',
    },
  ],

  english: [
    {
      question: 'What is the past tense of "go"?',
      answer: 'went',
      explanation: 'The past tense of go is went',
      difficulty: 'easy',
    },
    {
      question: 'Identify the metaphor in: "The classroom was a zoo".',
      answer: 'The classroom is compared to a zoo',
      explanation: 'A metaphor directly compares two unlike things without using "like" or "as"',
      difficulty: 'medium',
    },
    {
      question: 'Analyse the effect of the simile "Her voice was like a melody" in a persuasive essay.',
      answer: 'The simile creates a positive, pleasing connotation, evoking harmony to make the subject seem attractive.',
      explanation: 'Similes compare using "like" or "as" and shape the reader\'s emotional response through association',
      difficulty: 'hard',
    },
  ],

  general: [
    {
      question: 'How many continents are there?',
      answer: '7',
      explanation: 'The generally recognized continents are Africa, Antarctica, Asia, Australia, Europe, North America, and South America',
      difficulty: 'easy',
    },
    {
      question: 'What is the capital of Australia?',
      answer: 'Canberra',
      explanation: 'Canberra was chosen as the capital of Australia in 1908',
      difficulty: 'medium',
    },
  ],
};

export function useQuestionGenerator() {
  const [subject, setSubject] = useState('maths');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const generateQuestion = useCallback(() => {
    const templates = questionTemplates[subject];
    if (!templates || templates.length === 0) return;

    const matching = templates.filter((t) => t.difficulty === difficulty);
    const pool = matching.length > 0 ? matching : templates;
    const template = pool[Math.floor(Math.random() * pool.length)];
    setQuestion(template.question);
    setAnswer(template.answer);
    setExplanation(template.explanation);
  }, [subject, difficulty]);

  return {
    subject,
    setSubject,
    difficulty,
    setDifficulty,
    question,
    setQuestion,
    answer,
    setAnswer,
    explanation,
    setExplanation,
    generateQuestion,
  };
}

export default function QuestionGeneratorPage() {
  const { subject, setSubject, difficulty, setDifficulty, question, setQuestion, answer, setAnswer, explanation, setExplanation, generateQuestion } = useQuestionGenerator();

  const classes = {
    input: 'w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    button: 'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700',
    ghostButton: 'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    card: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-base text-gray-600 dark:text-gray-400',
    resultCard: 'mt-6 rounded-xl border p-6 bg-gray-50 dark:bg-gray-800',
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
            Question Generator
          </h1>
        </nav>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Generate Practice Questions
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={classes.input}
                aria-label="Subject"
              >
                <option value="maths">Maths</option>
                <option value="physics">Physics</option>
                <option value="english">English</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className={classes.input}
                aria-label="Difficulty"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={generateQuestion}
            className={classes.button}
            aria-label="Generate question"
          >
            Generate Question
          </button>
        </div>

        {question && (
          <div className={classes.resultCard}>
            <h3 className={classes.title}>Question</h3>
            <p className="text-lg mb-4">{question}</p>
            {answer && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Answer:</h4>
                <p className="text-gray-600 dark:text-gray-400">{answer}</p>
                {explanation && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <strong>Explanation:</strong> {explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {question && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                // Reset question
                setQuestion(null);
                setAnswer(null);
                setExplanation(null);
              }}
              className={classes.button}
              aria-label="Generate new question"
            >
              New Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}