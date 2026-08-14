"use client";

import { useState } from 'react';

interface Question {
  id: string;
  subject: string;
  topic: string;
  question: string;
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const questionTemplates: Record<string, { question: string; answer: string; explanation: string }[]> = {
  maths: [
    {
      question: 'What is the value of x in the equation 2x + 5 = 15?',
      answer: 'x = 5',
      explanation: 'Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5',
    },
    {
      question: 'Factorise x² + 5x + 6',
      answer: '(x + 2)(x + 3)',
      explanation: 'Find two numbers that multiply to 6 and add to 5: 2 and 3',
    },
    {
      question: 'Simplify (x³)²',
      answer: 'x⁶',
      explanation: 'Multiply the exponents: 3 × 2 = 6',
    },
  ],

  physics: [
    {
      question: 'What is the formula for force?',
      answer: 'F = m × a',
      explanation: 'Newton\'s Second Law of Motion: force equals mass times acceleration',
    },
    {
      question: 'What is the kinetic energy formula?',
      answer: 'KE = 0.5 × m × v²',
      explanation: 'Kinetic energy depends on mass and the square of velocity',
    },
  ],

  english: [
    {
      question: 'Identify the metaphor in: "The classroom was a zoo".',
      answer: 'The classroom is compared to a zoo',
      explanation: 'A metaphor directly compares two unlike things without using "like" or "as"',
    },
    {
      question: 'What is the past tense of "go"?',
      answer: 'went',
      explanation: 'The past tense of go is went',
    },
  ],

  general: [
    {
      question: 'What is the capital of Australia?',
      answer: 'Canberra',
      explanation: 'Canberra was chosen as the capital of Australia in 1908',
    },
    {
      question: 'How many continents are there?',
      answer: '7',
      explanation: 'The generally recognized continents are Africa, Antarctica, Asia, Australia, Europe, North America, and South America',
    },
  ],
};

export function useQuestionGenerator() {
  const [subject, setSubject] = useState('maths');
  const [difficulty, setDifficulty] = useState('easy');
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const generateQuestion = useCallback(() => {
    const templates = questionTemplates[subject];
    if (!templates || templates.length === 0) return;
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    setQuestion(template.question);
    setAnswer(template.answer);
    setExplanation(template.explanation);
  }, [subject]);

  return {
    subject,
    setSubject,
    difficulty,
    setDifficulty,
    question,
    answer,
    explanation,
    generateQuestion,
  };
}

export default function QuestionGeneratorPage() {
  const { subject, setSubject, difficulty, question, answer, explanation, generateQuestion } = useQuestionGenerator();
  const isDark = true; // simplified for this build

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
                className={input}
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
                onChange={(e) => setDifficulty(e.target.value)}
                className={input}
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
          <div className="resultCard">
            <h3 className="title">Question</h3>
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