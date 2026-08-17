"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface QuizState {
  metadata: QuizMetadata;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  completed: boolean;
}

interface LastAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

interface QuizMetadata {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const QUIZ_KEY = 'quiz-maker-quiz';

const EMPTY_QUIZ: QuizState = {
  metadata: { subject: '', topic: '', difficulty: 'medium' },
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  completed: false,
};

function loadQuiz(): QuizState {
  if (typeof window === 'undefined') return EMPTY_QUIZ;
  try {
    const stored = localStorage.getItem(QUIZ_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as QuizState;
      if (Array.isArray(parsed.questions)) return parsed;
    }
  } catch {
    // fall through to empty state
  }
  return EMPTY_QUIZ;
}

export function useQuizMaker() {
  const [quizState, setQuizState] = useState<QuizState>(loadQuiz);
  const [lastAnswer, setLastAnswer] = useState<LastAnswer | null>(null);

  useEffect(() => {
    localStorage.setItem(QUIZ_KEY, JSON.stringify(quizState));
  }, [quizState]);

  const addQuestion = useCallback(
    (question: string, options: string[], correctAnswerIndex: number, explanation: string, metadata?: QuizMetadata) => {
      const newQuestion: QuizQuestion = {
        id: Date.now().toString(),
        question,
        options: [...options],
        correctAnswerIndex,
        explanation,
      };
      setQuizState((prev) => ({
        metadata: metadata || prev.metadata,
        questions: [...prev.questions, newQuestion],
        currentQuestionIndex: prev.questions.length,
        score: prev.score,
        completed: false,
      }));
      setLastAnswer(null);
    },
    []
  );

  const selectAnswer = useCallback((index: number) => {
    setQuizState((prev) => {
      const question = prev.questions[prev.currentQuestionIndex];
      if (!question || prev.completed || index < 0 || index >= question.options.length) {
        return prev;
      }
      const correct = index === question.correctAnswerIndex;
      setLastAnswer({
        questionId: question.id,
        selectedIndex: index,
        correct,
      });
      const isLast = prev.currentQuestionIndex >= prev.questions.length - 1;
      return {
        ...prev,
        score: correct ? prev.score + 1 : prev.score,
        completed: isLast,
      };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setQuizState((prev) => {
      if (prev.completed) return prev;
      return {
        ...prev,
        currentQuestionIndex: Math.min(
          prev.currentQuestionIndex + 1,
          prev.questions.length - 1
        ),
      };
    });
    setLastAnswer(null);
  }, []);

  const resetQuiz = useCallback(() => {
    setQuizState(EMPTY_QUIZ);
    setLastAnswer(null);
  }, []);

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex] ?? null;
  const answeredCount = quizState.completed
    ? quizState.questions.length
    : quizState.currentQuestionIndex + (lastAnswer ? 1 : 0);
  const progressPercentage = quizState.questions.length === 0
    ? 0
    : Math.round((answeredCount / quizState.questions.length) * 100);

  return {
    quizState,
    addQuestion,
    selectAnswer,
    nextQuestion,
    resetQuiz,
    currentQuestion,
    lastAnswer,
    progressPercentage,
  };
}

export default function QuizMakerPage() {
  const {
    quizState,
    addQuestion,
    selectAnswer,
    nextQuestion,
    resetQuiz,
    currentQuestion,
    lastAnswer,
    progressPercentage,
  } = useQuizMaker();

  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [formError, setFormError] = useState('');
  const [showSubject, setShowSubject] = useState(false);
  const [subject, setSubject] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const classes = {
    input:
      'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    button:
      'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700',
    ghostButton:
      'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    card: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-base text-gray-600 dark:text-gray-400',
    resultCard: 'mt-6 rounded-xl border p-6 bg-gray-50 dark:bg-gray-800',
    progressBar: 'bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden',
    progressFill: 'h-full bg-blue-600 transition-all duration-300',
  };

  const handleAddQuestion = () => {
    const options = [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()];
    const filled = options.filter((o) => o.length > 0);
    if (!question.trim()) {
      setFormError('Please enter a question.');
      return;
    }
    if (filled.length < 2) {
      setFormError('Please fill in at least two answer options.');
      return;
    }
    if (correctIndex >= filled.length) {
      setFormError('The correct answer must point to one of the filled options.');
      return;
    }
    const metadata: QuizMetadata = {
      subject: subject || 'General',
      topic: topic || 'General',
      difficulty: difficulty,
    };
    addQuestion(question.trim(), options, correctIndex, explanation.trim(), metadata);
    setQuestion('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectIndex(0);
    setExplanation('');
    setFormError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-8 border-b border-gray-200 pb-4 dark:border-gray-700">
          <Link
            href="/students"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Student Tools Hub
          </Link>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Quiz Maker
            </h1>
            {quizState.questions.length > 0 && (
              <button
                type="button"
                onClick={resetQuiz}
                className={classes.ghostButton}
                aria-label="Reset quiz"
              >
                Start over
              </button>
            )}
          </div>
        </nav>

        {/* Subject/Topic selection header */}
        {quizState.questions.length === 0 && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-font-medium text-gray-900 dark:text-white mb-4">Create Quiz</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  aria-label="Subject"
                >
                  <option value="">Select subject</option>
                  <option value="Mathematical Methods">Mathematical Methods</option>
                  <option value="Physics">Physics</option>
                  <option value="English Language">English Language</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Specialist Maths">Specialist Maths</option>
                  <option value="Further Maths">Further Maths</option>
                  <option value="General">General</option>
                </select>
                <button
                  type="button"
                  onClick={() => setShowSubject(true)}
                  className="mt-2 ghostButton text-xs"
                  aria-label="Add custom subject"
                >
                  + Add custom
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  aria-label="Topic"
                >
                  <option value="">Select topic</option>
                  <option value="Algebra">Algebra</option>
                  <option value="Calculus">Calculus</option>
                  <option value="Vectors">Vectors</option>
                  <option value="Motion">Motion</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Waves">Waves</option>
                  <option value="Probability">Probability</option>
                  <option value="Statistics">Statistics</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  aria-label="Difficulty"
                >
                  <option value="medium">Medium</option>
                  <option value="easy">Easy</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            {showSubject && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Custom Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  aria-label="Custom subject name"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setSubject(''); setShowSubject(false); }}
                    className="ghostButton"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowSubject(false); }}
                    className="button"
                    aria-label="Save subject"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {quizState.questions.length === 0 ? (
          <div className={classes.card}>
            <h2 className={classes.title}>Create Your Quiz</h2>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Add a question with multiple-choice options to build your quiz.
            </p>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="quiz-question">
                Question
              </label>
              <textarea
                id="quiz-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={2}
                className={classes.input}
                placeholder="e.g. What is 2 + 2?"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: 'A', value: optionA, setValue: setOptionA },
                { label: 'B', value: optionB, setValue: setOptionB },
                { label: 'C', value: optionC, setValue: setOptionC },
                { label: 'D', value: optionD, setValue: setOptionD },
              ].map((option) => (
                <div key={option.label}>
                  <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor={`quiz-option-${option.label}`}>
                    Option {option.label}
                  </label>
                  <input
                    id={`quiz-option-${option.label}`}
                    type="text"
                    value={option.value}
                    onChange={(e) => option.setValue(e.target.value)}
                    className={classes.input}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="quiz-correct">
                Correct answer
              </label>
              <select
                id="quiz-correct"
                value={correctIndex}
                onChange={(e) => setCorrectIndex(Number(e.target.value))}
                className={classes.input}
              >
                {[0, 1, 2, 3].map((i) => (
                  <option key={i} value={i}>
                    Option {String.fromCharCode(65 + i)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="quiz-explanation">
                Explanation (optional)
              </label>
              <textarea
                id="quiz-explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={2}
                className={classes.input}
                placeholder="Shown after the answer is revealed"
              />
            </div>

            {formError && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{formError}</p>
            )}

            <div className="mt-6 flex justify-end">
              <button type="button" onClick={handleAddQuestion} className={classes.button} aria-label="Add question">
                Add Question & Start Quiz
              </button>
            </div>
          </div>
        ) : quizState.completed ? (
          <div className={classes.resultCard}>
            <h2 className={classes.title}>Quiz Complete!</h2>
            <p className={classes.subtitle}>
              Score: {quizState.score} out of {quizState.questions.length}
            </p>
            <p className="mb-4 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round((quizState.score / quizState.questions.length) * 100)}%
            </p>
            <button type="button" onClick={resetQuiz} className={classes.button} aria-label="Retake quiz">
              Retake Quiz
            </button>
          </div>
        ) : (
          currentQuestion && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length} · Score {quizState.score}
                </p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{progressPercentage}%</p>
              </div>
              <div
                className={classes.progressBar}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercentage}
              >
                <div className={classes.progressFill} style={{ width: `${progressPercentage}%` }} />
              </div>

              <div className={classes.card}>
                <h2 className={`${classes.title} mb-4`}>{currentQuestion.question}</h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {currentQuestion.options.map((option, index) => {
                    const isRevealed = lastAnswer?.questionId === currentQuestion.id;
                    const isSelected = isRevealed && lastAnswer.selectedIndex === index;
                    const isCorrect = isRevealed && index === currentQuestion.correctAnswerIndex;
                    const optionLabel = String.fromCharCode(65 + index);
                    let buttonClass = classes.button;
                    if (isRevealed) {
                      if (isCorrect) {
                        buttonClass =
                          'inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors';
                      } else if (isSelected) {
                        buttonClass =
                          'inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors';
                      } else {
                        buttonClass =
                          'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:text-gray-300';
                      }
                    }
                    return (
                      <button
                        type="button"
                        key={index}
                        onClick={() => selectAnswer(index)}
                        disabled={isRevealed}
                        className={buttonClass}
                        aria-label={`Answer option ${optionLabel}`}
                      >
                        <span className="font-semibold">{optionLabel}.</span> {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {lastAnswer && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <p className={`text-sm font-medium ${lastAnswer.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {lastAnswer.correct ? 'Correct!' : `Incorrect. The answer was ${String.fromCharCode(65 + currentQuestion.correctAnswerIndex)}.`}
                  </p>
                  {currentQuestion.explanation && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{currentQuestion.explanation}</p>
                  )}
                </div>
              )}

              {lastAnswer && quizState.currentQuestionIndex < quizState.questions.length - 1 && (
                <div className="mt-6 flex justify-end">
                  <button type="button" onClick={nextQuestion} className={classes.button} aria-label="Next question">
                    Next Question →
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}