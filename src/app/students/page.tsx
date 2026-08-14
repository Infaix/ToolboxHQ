import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Tools - ToolboxHQ',
  description: 'Free student tools for VCE, ATAR, GPA, calculators, planners, flashcards, and productivity. All client-side, private, and instantly accessible.',
};

export default function StudentToolsPage() {
  // Define all student tools with categorization
  const allTools = [
    // Academic Results
    {
      name: 'ATAR Calculator',
      path: '/students/atar-calculator',
      category: 'Academic Results',
      description: 'Estimate your ATAR based on VCE study scores',
      icon: '📊',
      prominent: true,
    },
    {
      name: 'Study Score Calculator',
      path: '/students/study-score-calculator',
      category: 'Academic Results',
      description: 'Calculate estimated study scores for VCE subjects',
      icon: '🎓',
    },
    {
      name: 'ATAR Goal Calculator',
      path: '/students/atar-goal-calculator',
      category: 'Academic Results',
      description: 'Determine what study scores you need to achieve your target ATAR',
      icon: '🎯',
    },
    {
      name: 'Grade Calculator',
      path: '/students/grade-calculator',
      category: 'Academic Results',
      description: 'Calculate weighted overall percentage from assessments',
      icon: '📝',
    },
    {
      name: 'GPA Calculator',
      path: '/students/gpa-calculator',
      category: 'Academic Results',
      description: 'Calculate weighted GPA on 4.0 scale',
      icon: '📈',
    },
    {
      name: 'Weighted Average Calculator',
      path: '/students/weighted-average',
      category: 'Academic Results',
      description: 'Calculate weighted averages from multiple values and weights',
      icon: '⚖️',
    },

    // Study & Productivity
    {
      name: 'Study Planner',
      path: '/students/study-planner',
      category: 'Study & Productivity',
      description: 'Plan study sessions and track progress with localStorage',
      icon: '📅',
    },
    {
      name: 'Flashcards',
      path: '/students/flashcards',
      category: 'Study & Productivity',
      description: 'Study with digital flashcards stored in browser localStorage',
      icon: '🃏',
    },
    {
      name: 'Study Timer',
      path: '/students/study-timer',
      category: 'Study & Productivity',
      description: 'Pomodoro timer with custom durations',
      icon: '⏱️',
    },
    {
      name: 'Exam Countdown',
      path: '/students/exam-countdown',
      category: 'Study & Productivity',
      description: 'Countdown timer to your exams with localStorage persistence',
      icon: '📢',
    },
    {
      name: 'Notes',
      path: '/students/notes',
      category: 'Study & Productivity',
      description: 'Create, edit, and organize notes by subject',
      icon: '📝',
    },
    {
      name: 'Focus Dashboard',
      path: '/students/focus-dashboard',
      category: 'Study & Productivity',
      description: 'Productivity dashboard with tasks, timer, and exams',
      icon: '📊',
    },

    // Maths & Science
    {
      name: 'Scientific Calculator',
      path: '/students/scientific-calculator',
      category: 'Maths & Science',
      description: 'Arithmetic, powers, roots, trig, logarithms',
      icon: '🧮',
    },
    {
      name: 'Physics Calculator',
      path: '/students/physics-calculator',
      category: 'Maths & Science',
      description: 'Solve physics problems with common formulas',
      icon: '🧪',
    },
    {
      name: 'Unit Converter',
      path: '/students/unit-converter',
      category: 'Maths & Science',
      description: 'Convert between units (length, mass, temperature, etc.)',
      icon: '🔄',
    },
    {
      name: 'Maths Formula Reference',
      path: '/students/maths-formulas',
      category: 'Maths & Science',
      description: 'Algebra, quadratics, functions, geometry, calculus',
      icon: '📚',
    },
    {
      name: 'Physics Formula Reference',
      path: '/students/physics-formulas',
      category: 'Maths & Science',
      description: 'Mechanics, energy, momentum, waves, electricity',
      icon: '📖',
    },
    {
      name: 'Question Generator',
      path: '/students/question-generator',
      category: 'Maths & Science',
      description: 'Generate random practice prompts by subject',
      icon: '❓',
    },
    {
      name: 'Quiz Maker',
      path: '/students/quiz-maker',
      category: 'Additional',
      description: 'Create and practice quizzes with localStorage persistence',
      icon: '📝',
    },
  ];

  // Separate prominent tools (ATAR etc.) from the rest
  const prominentTools = allTools.filter((t) => t.prominent);
  const otherTools = allTools.filter((t) => !t.prominent);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-700 mb-10 pb-6">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Student Tools
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Free tools for studying, VCE, maths, physics and productivity. All run entirely in your browser.
              </p>
            </div>
            <svg
              className="h-12 w-12 text-blue-600 dark:text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
</header>

      {/* Prominent Tools Section - ATAR Calculator leads off */}
        <section className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Your ATAR & Study Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prominentTools.map((tool) => (
              <a
                key={tool.path}
                href={tool.path}
                className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400 cursor-pointer"
              >
                <div className="h-14 w-14 rounded-xl flex items-center justify-center mb-4 text-3xl opacity-90 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {tool.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">
                  {tool.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Category Grid */}
        <section>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">All Student Tools</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {otherTools.map((tool) => (
              <a
                key={tool.name}
                href={tool.path}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400 cursor-pointer"
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3 text-2xl opacity-90 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {tool.icon}
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {tool.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Privacy notice */}
        <footer className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Your student data stays on your device. These tools run entirely in your browser and do not require an account or server.</p>
          <p className="mt-2">
            <a href="/"
              className="transition-colors hover:text-gray-700 dark:hover:text-gray-200"
            >
              Back to ToolboxHQ
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}