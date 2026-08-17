import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Student Tools - ToolboxHQ',
  description: 'Free student tools for VCE, ATAR, GPA, calculators, planners, flashcards, and productivity. All client-side, private, and instantly accessible.',
};

export default function StudentToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
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
              Student Tools
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Free tools for studying, VCE, maths, physics and productivity. All run entirely in your browser.
            </p>
          </div>
        </nav>

        {/* Prominent Tools Section - ATAR Calculator leads off */}
        <section className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Your ATAR & Study Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'ATAR Calculator', path: '/students/atar-calculator', icon: '📊', description: 'Estimate your ATAR based on VCE study scores' },
              { name: 'ATAR Goal Calculator', path: '/students/atar-goal-calculator', icon: '🎯', description: 'Determine what study scores you need to achieve your target ATAR' },
              { name: 'Study Score Calculator', path: '/students/study-score-calculator', icon: '🎓', description: 'Calculate estimated study scores for VCE subjects' },
              { name: 'Grade Calculator', path: '/students/grade-calculator', icon: '📝', description: 'Calculate weighted overall percentage from assessments' },
              { name: 'GPA Calculator', path: '/students/gpa-calculator', icon: '📈', description: 'Calculate weighted GPA on 4.0 scale' },
              { name: 'Weighted Average Calculator', path: '/students/weighted-average', icon: '⚖️', description: 'Calculate weighted averages from multiple values and weights' },
            ].map((tool) => (
              <Link
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
              </Link>
            ))}
          </div>
        </section>

        {/* Category Grid */}
        <section>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">All Student Tools</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[
              { name: 'Study Planner', path: '/students/study-planner', category: 'Study & Productivity', icon: '📅', description: 'Plan study sessions and track progress with localStorage' },
              { name: 'Flashcards', path: '/students/flashcards', category: 'Study & Productivity', icon: '🃏', description: 'Study with digital flashcards stored in browser localStorage' },
              { name: 'Study Timer', path: '/students/study-timer', category: 'Study & Productivity', icon: '⏱️', description: 'Pomodoro timer with custom durations' },
              { name: 'Exam Countdown', path: '/students/exam-countdown', category: 'Study & Productivity', icon: '📢', description: 'Countdown timer to your exams with localStorage persistence' },
                { name: 'Notes', path: '/students/notes', category: 'Study & Productivity', icon: '📝', description: 'Create, edit, and organize notes by subject' },
              { name: 'Focus Dashboard', path: '/students/focus-dashboard', category: 'Study & Productivity', icon: '📊', description: 'Productivity dashboard with tasks, timer, and exams' },
              { name: 'Scientific Calculator', path: '/students/scientific-calculator', category: 'Maths & Science', icon: '🧮', description: 'Arithmetic, powers, roots, trig, logarithms' },
              { name: 'Physics Calculator', path: '/students/physics-calculator', category: 'Maths & Science', icon: '🧪', description: 'Solve physics problems with common formulas' },
              { name: 'Unit Converter', path: '/students/unit-converter', category: 'Maths & Science', icon: '🔄', description: 'Convert between units (length, mass, temperature, etc.)' },
              { name: 'Maths Formula Reference', path: '/students/maths-formulas', category: 'Maths & Science', icon: '📚', description: 'Algebra, quadratics, functions, geometry, calculus' },
              { name: 'Physics Formula Reference', path: '/students/physics-formulas', category: 'Maths & Science', icon: '📖', description: 'Mechanics, energy, momentum, waves, electricity' },
              { name: 'Question Generator', path: '/students/question-generator', category: 'Maths & Science', icon: '❓', description: 'Generate random practice prompts by subject' },
              { name: 'Quiz Maker', path: '/students/quiz-maker', category: 'Additional', icon: '📝', description: 'Create and practice quizzes with localStorage persistence' },
            ].map((tool) => (
              <Link
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
              </Link>
            ))}
          </div>
        </section>

        {/* Privacy notice */}
        <footer className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Your student data stays on your device. These tools run entirely in your browser and do not require an account or server.</p>
          <p className="mt-2">
            <Link href="/" className="transition-colors hover:text-gray-700 dark:hover:text-gray-200">
              Back to ToolboxHQ
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}