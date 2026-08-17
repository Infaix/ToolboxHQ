"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // ISO date string
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

const SUBJECTS_KEY = 'study-planner-subjects';
const TASKS_KEY = 'study-planner-tasks';

function loadSubjects(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(SUBJECTS_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function loadTasks(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(TASKS_KEY);
    return stored ? (JSON.parse(stored) as Task[]) : [];
  } catch {
    return [];
  }
}

export function useStudyPlanner() {
  const [subjects, setSubjects] = useState<string[]>(loadSubjects);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  useEffect(() => {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const upcomingTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks
      .filter((t) => !t.completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks]);

  const completedTasks = useCallback(() => {
    return tasks.filter((t) => t.completed);
  }, [tasks]);

  const addTask = useCallback(
    (title: string, subject: string, dueDate: string, priority: 'low' | 'medium' | 'high') => {
      setTasks((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          title,
          subject,
          dueDate,
          priority,
          completed: false,
        },
      ]);
      const trimmedSubject = subject.trim();
      if (trimmedSubject) {
        setSubjects((prev) =>
          prev.includes(trimmedSubject) ? prev : [...prev, trimmedSubject]
        );
      }
    },
    []
  );

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    subjects,
    tasks,
    upcomingTasks,
    completedTasks,
    addTask,
    toggleTask,
    removeTask,
  };
}

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

function durationMin(dueDate: string): number {
  // Parse due date to calculate minutes until due, capped at a reasonable study session
  if (!dueDate) return 25;
  const due = new Date(dueDate).getTime();
  const now = new Date().getTime();
  const diffMin = Math.max(0, Math.ceil((due - now) / 60000));
  // Cap at 120 minutes and floor at 25
  return Math.min(120, Math.max(25, diffMin));
}

export default function StudyPlannerPage() {
  const { subjects, upcomingTasks, completedTasks, addTask, toggleTask, removeTask } = useStudyPlanner();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [formError, setFormError] = useState('');
  const [startTimer, setStartTimer] = useState(false);

  const classes = {
    input:
      'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    button:
      'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700',
    ghostButton:
      'inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    card: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-base text-gray-600 dark:text-gray-400',
    resultCard: 'mt-6 rounded-xl border p-6 bg-gray-50 dark:bg-gray-800',
  };

  const priorityClasses = {
    low: 'text-green-600 dark:text-green-400',
    medium: 'text-yellow-600 dark:text-yellow-300',
    high: 'text-red-600 dark:text-red-300',
  };

const handleAddTask = () => {
    if (!title.trim()) {
      setFormError('Please enter a task title.');
      return;
    }
    if (!dueDate) {
      setFormError('Please choose a due date.');
      return;
    }
    addTask(title.trim(), subject.trim() || 'General', dueDate, priority);
    setTitle('');
    setSubject('');
    setPriority('medium');
    setDueDate('');
    setFormError('');
    setStartTimer(false);
  };

  const upcoming = upcomingTasks();
  const completed = completedTasks();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Study Planner
          </h1>
        </nav>

        <div className={classes.card}>
          <h2 className={`${classes.title} mb-4`}>Add Study Task</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="task-title">
                Task Title
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Review Chapter 4"
                className={classes.input}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="task-subject">
                Subject
              </label>
              <input
                id="task-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                list="subject-options"
                placeholder="e.g. Maths"
                className={classes.input}
              />
              <datalist id="subject-options">
                {subjects.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className={classes.input}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="task-due">
                Due Date
              </label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={classes.input}
              />
            </div>
          </div>

          {formError && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{formError}</p>}

          {startTimer && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-semibold text-gray-900 dark:text-white mb-4">Start Study Session</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start a focused study session with your task pre-configured?
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mb-4">
                <div>
                  <p className="font-medium text-gray-600 dark:text-gray-400">Subject</p>
                  <p className="font-bold text-gray-900 dark:text-white">{subject || 'General'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600 dark:text-gray-400">Task</p>
                  <p className="font-bold text-gray-900 dark:text-white">{title || 'Study session'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600 dark:text-gray-400">Duration</p>
                  <p className="font-bold text-gray-900 dark:text-white">{durationMin(dueDate)} min</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStartTimer(false)}
                  className="ghostButton flex-1"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStartTimer(false);
                    // Save task config to localStorage for the timer to read
                    const taskConfig = {
                      subject: subject.trim() || 'General',
                      task: title.trim() || 'Study session',
                      durationMin: durationMin(dueDate),
                    };
                    if (typeof window !== 'undefined') {
                      try {
                        localStorage.setItem('study-planner-task-config', JSON.stringify(taskConfig));
                        // Navigate to study timer
                        window.location.href = '/students/study-timer';
                      } catch {
                        // ignored
                      }
                    }
                  }}
                  className="button flex-1"
                  aria-label="Start study session"
                >
                  Start Session
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button type="button" onClick={() => setStartTimer(true)} className={classes.button} aria-label="Add task and start timer">
              Add Task & Start Timer
            </button>
          </div>
        </div>

        {upcoming.length > 0 && (
          <div className={classes.resultCard}>
            <h3 className={classes.title}>Upcoming Tasks</h3>
            <p className={classes.subtitle}>
              {upcoming.length} task{upcoming.length !== 1 ? 's' : ''} coming up
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {upcoming.map((task) => (
                <li key={task.id} className="flex flex-wrap items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Mark ${task.title} complete`}
                    className="h-4 w-4"
                  />
                  <span className={priorityClasses[task.priority]}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{task.title}</span>
                  <span className="text-gray-500 dark:text-gray-400">{task.subject}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    className="ml-auto text-sm text-red-500 transition-colors hover:text-red-700 dark:hover:text-red-400"
                    aria-label={`Delete ${task.title}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {completed.length > 0 && (
          <div className={classes.resultCard}>
            <h3 className={classes.title}>Completed Tasks</h3>
            <p className={classes.subtitle}>
              {completed.length} task{completed.length !== 1 ? 's' : ''} completed
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {completed.map((task) => (
                <li key={task.id} className="flex flex-wrap items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    aria-label={`Restore ${task.title}`}
                    className="h-4 w-4"
                  />
                  <span className="line-through text-green-600 dark:text-green-400">{task.title}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTask(task.id)}
                    className="ml-auto text-sm text-red-500 transition-colors hover:text-red-700 dark:hover:text-red-400"
                    aria-label={`Delete ${task.title}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {subjects.length === 0 && upcoming.length === 0 && completed.length === 0 && (
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Add a study task above to get started. You can also re-use subjects from previous tasks.
          </p>
        )}
      </div>
    </div>
  );
}
