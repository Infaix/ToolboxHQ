"use client";

import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  completed: boolean;
}

export function useQuizMaker() {
  const { theme } = useTheme();
  const [quizState, setQuizState] = useState<QuizState>(() => {
    if (typeof window === 'undefined') {
      return {
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        completed: false,
      };
    }
    const stored = localStorage.getItem('quiz-maker-quiz');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {
          questions: [],
          currentQuestionIndex: 0,
          score: 0,
          completed: false,
        };
      }
    }
    return {
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      completed: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('quiz-maker-quiz', JSON.stringify(quizState));
  }, [quizState]);

  const getRandomOptions = useCallback((correctAnswer: string, options: string[]) => {
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    return shuffled;
  }, []);

  const addQuestion = useCallback((question: string, options: string[], correctAnswerIndex: number, explanation: string) => {
    setQuizState(prev => {
      const newQuestion: QuizQuestion = {
        id: Date.now().toString(),
        question,
        options: [...options],
        correctAnswerIndex,
        explanation,
      };
      return {
        questions: [...prev.questions, newQuestion],
        currentQuestionIndex: prev.questions.length,
        score: prev.score,
        completed: false,
      };
    });
  }, []);

  const selectAnswer = useCallback((index: number) => {
    setQuizState(prev => {
      const question = prev.questions[prev.currentQuestionIndex];
      if (index === question.correctAnswerIndex) {
        return {
          ...prev,
          score: prev.score + 1,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        };
      } else {
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        };
      }
    });
  }, []);

  const finishQuiz = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      completed: true,
    }));
  }, []);

  const isLastQuestion = useCallback(() => {
    return quizState.currentQuestionIndex >= quizState.questions.length - 1;
  }, [quizState]);

  const isCompleted = useCallback(() => {
    return quizState.completed;
  }, [quizState]);

  const resetQuiz = useCallback(() => {
    setQuizState({
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      completed: false,
    });
  }, []);

  const totalQuestions = useCallback(() => {
    return quizState.questions.length;
  }, [quizState]);

  const canAnswer = useCallback(() => {
    return !quizState.completed && quizState.currentQuestionIndex < quizState.questions.length;
  }, [quizState]);

  const nextQuestion = useCallback(() => {
    if (!canAnswer()) return;
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
    }));
  }, [quizState]);

  return {
    quizState,
    getRandomOptions,
    addQuestion,
    selectAnswer,
    finishQuiz,
    isLastQuestion,
    isCompleted,
    resetQuiz,
    progressPercentage: () => {
      if (quizState.questions.length === 0) return 0;
      return (quizState.currentQuestionIndex / quizState.questions.length) * 100;
    },
    nextQuestion,
    totalQuestions,
  };
}

export default function QuizMakerPage() {
  const { quizState, addQuestion, selectAnswer, finishQuiz, isLastQuestion, isCompleted, resetQuiz, progressPercentage, nextQuestion } = useQuizMaker();
  const isDark = true; // simplified for this build

  const classes = {
    input: 'w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    button: 'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700',
    ghostButton: 'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    card: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-base text-gray-600 dark:text-gray-400',
    resultCard: 'mt-6 rounded-xl border p-6 bg-gray-50 dark:bg-gray-800',
    progressBar: 'bg-blue-100 dark:bg-blue-800 h-2 rounded-full mb-4',
    progressFill: 'w-full bg-blue-600 dark:bg-blue-700 transition-all duration-300',
  };

  const canProceed = quizState.currentQuestionIndex < quizState.questions.length;

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
            Quiz Maker
          </h1>
        </nav>

        {quizState.completed && (
          <div className="resultCard">
            <h3 className="title">Quiz Complete!</h3>
            <p className="subtitle">
              Score: {quizState.score} out of {quizState.questions.length}
            </p>
            <button
              type="button"
              onClick={resetQuiz}
              className={classes.button}
              aria-label="Reset quiz"
            >
              Retake Quiz
            </button>
          </div>
        )}

        {quizState.questions.length > 0 && !quizState.completed && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quiz in Progress
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
            </p>
            <div className="progressBar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercentage()}>
              <div className="progressFill" style={{ width: `${progressPercentage()}%` }} />
            </div>

            <div className="card mb-6">
              <h3 className="title">Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {quizState.questions[quizState.currentQuestionIndex].question}
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quizState.questions[quizState.currentQuestionIndex].options.map((option, index) => (
                  <button
                    type="button"
                    onClick={() => selectAnswer(index)}
                    key={index}
                    className={classes.button}
                    aria-label={`Answer option ${index}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {quizState.completed || (canProceed && quizState.questions.length > 0) && (
          <div>
            {isLastQuestion() && quizState.questions.length > 0 && (
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Last question - make your answer count!
              </p>
            )}
          </div>
        )}

        {quizState.questions.length === 0 && (
          <div className="mb-8">
            <h3 className="title">Create Your Quiz</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add questions with multiple-choice options to create your own quiz.
            </p>
            <button
              type="button"
              onClick={() => alert('Add question form')}
              className={classes.button}
              aria-label="Create quiz"
            >
              Add Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}