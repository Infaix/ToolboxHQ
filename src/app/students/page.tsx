import type { Metadata } from 'next';
import { useContext } from 'react';
import ThemeContext from '@/contexts/ThemeContext';
import { getToolsByGroup, toolUrl } from '@/lib/toolRegistry';

interface StudentTool {
  name: string;
  path: string;
  description: string;
  icon: string;
}

const studentTools: StudentTool[] = [
  {
    name: 'Grade Calculator',
    path: '/students/grade-calculator',
    description: 'Calculate weighted overall percentage from assessments',
    icon: '📝',
  },
  {
    name: 'ATAR Calculator',
    path: '/students/atar-calculator',
    description: 'Estimate your ATAR based on VCE study scores',
    icon: '📊',
  },
  {
    name: 'VCE Study Score Calculator',
    path: '/students/study-score-calculator',
    description: 'Calculate aggregate and study scores for VCE subjects',
    icon: '🎓',
  },
  {
    name: 'ATAR Goal Calculator',
    path: '/students/atar-goal-calculator',
    description: 'Determine what study scores you need to achieve your target ATAR',
    icon: '🎯',
  },
  {
    name: 'Weighted Average Calculator',
    path: '/students/weighted-average-calculator',
    description: 'Calculate weighted averages from multiple values and weights',
    icon: '⚖️',
  },
  {
    name: 'Flashcards',
    path: '/students/flashcards',
    description: 'Study with digital flashcards stored in browser localStorage',
    icon: '🃏',
  },
  {
    name: 'Study Planner',
    path: '/students/study-planner',
    description: 'Plan your study sessions and track progress with localStorage',
    icon: '📅',
  },
  {
    name: 'Study Timer',
    path: '/students/study-timer',
    description: 'Pomodoro-style study timer stored in browser localStorage',
    icon: '⏱️',
  },
  {
    name: 'Exam Countdown',
    path: '/students/exam-countdown',
    description: 'Countdown timer to your exams with localStorage persistence',
    icon: '📢',
  },
  {
    name: 'Quiz Maker',
    path: '/students/quiz-maker',
    description: 'Create and practice quizzes with localStorage persistence',
    icon: '📝',
  },
];

export const metadata: Metadata = {
  title: 'Student Tools',
  description: 'Useful free tools for school and study — client-side, private, and instantly accessible.',
};

export default function StudentToolsPage() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-12 border-b border-gray-200 dark:border-gray-700 pb-6">
          <Link
            href="/"
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
            All tools
          </Link>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Student Tools
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Client-side tools for school and study. Your data stays in your browser.
          </p>
        </nav>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {studentTools.map((tool) => (
            <div
              key={tool.name}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400 cursor-pointer"
              onClick={() => window.location.href = tool.path}
            >
              <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-4 text-3xl opacity-90 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {tool.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {tool.name}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">
                {tool.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>All tools run entirely in your browser. Your data is never sent to a server.</p>
          <p className="mt-2">
            <a href="/" className="transition-colors hover:text-gray-700 dark:hover:text-gray-200">
              Browse all tools
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}