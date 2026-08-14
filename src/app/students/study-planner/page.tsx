"use client";

import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // ISO date string
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface StudyPlannerState {
  subjects: string[];
  tasks: Task[];
}

export function useStudyPlanner() {
  const { theme } = useTheme();
  const [subjects, setSubjects] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('study-planner-subjects');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('study-planner-subjects', JSON.stringify(subjects));
  }, [subjects]);

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('study-planner-tasks');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('study-planner-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const upcomingTasks = useCallback(() => {
    const today = new Date();
    return tasks
      .filter((t) => !t.completed && new Date(t.dueDate) >= today)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks]);

  const completedTasks = useCallback(() => {
    return tasks.filter((t) => t.completed);
  }, [tasks]);

  const addTask = useCallback((title: string, subject: string, dueDate: string, priority: 'low' | 'medium' | 'high') => {
    setTasks(prev => [...prev, {
      id: Date.now().toString(),
      title,
      subject,
      dueDate,
      priority,
      completed: false,
    }]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev =>
      prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter((t) => t.id !== id));
  }, []);

  return {
    subjects,
    setSubjects,
    tasks,
    setTasks,
    upcomingTasks,
    completedTasks,
    addTask,
    toggleTask,
    removeTask,
  };
}

export default function StudyPlannerPage() {
  const { theme } = useTheme();
  const isDark = true; // simplified for this build

  const {
    subjects,
    setSubjects,
    tasks,
    setTasks,
    upcomingTasks,
    completedTasks,
    addTask,
    toggleTask,
    removeTask,
  } = useStudyPlanner();

  const classes = {
    input: `w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white`,
    row: 'flex items-center gap-2',
    cell: 'flex-1 min-w-0',
    label: 'text-sm font-medium text-gray-600 dark:text-gray-400',
    button: 'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700',
    ghostButton: 'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    card: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
    subtitle: 'text-base text-gray-600 dark:text-gray-400',
    resultCard: 'mt-6 rounded-xl border p-6 bg-gray-50 dark:bg-gray-800',
    warning: 'mt-4 p-4 rounded-md bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    numberInput: 'w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
  };

  const priorityClasses = {
    low: 'text-green-500 dark:text-green-400',
    medium: 'text-yellow-500 dark:text-yellow-300',
    high: 'text-red-500 dark:text-red-300',
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
            Study Planner
          </h1>
        </nav>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Add Study Task
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Task Title
              </label>
              <input
                type="text"
                placeholder="e.g. Review Chapter 4"
                className={classes.input}
                aria-label="Task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Subject
              </label>
              <select className={classes.input}>
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Priority
              </label>
              <select className={classes.input}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Due Date
              </label>
              <input
                type="date"
                className={classes.input}
                aria-label="Due date"
              />
            </div>
          </div>

<button
            type="button"
            onClick={() => {
              // Would need more state to capture inputs
              alert('Task addition - implement form capture');
            }}
          >
            Add Task
          </button>
        </div>

        {upcomingTasks().length > 0 && (
          <div className="resultCard mb-6">
            <h3 className="title">Upcoming Tasks</h3>
            <p className="subtitle">
              {upcomingTasks().length} task{upcomingTasks().length !== 1 ? 's' : ''} coming up
            </p>
            <ul className="space-y-2 text-sm">
              {upcomingTasks().slice(0, 5).map((task) => (
                <li key={task.id} className="flex items-center gap-2">
                  <span className={priorityClasses[task.priority]}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  <span>
                    <strong>{task.title}</strong> -
                    {task.subject}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {completedTasks().length > 0 && (
          <div className="resultCard">
            <h3 className="title">Completed Tasks</h3>
            <p className="subtitle">
              {completedTasks().length} task{completedTasks().length !== 1 ? 's' : ''} completed
            </p>
            <ul className="space-y-2 text-sm">
              {completedTasks().slice(0, 5).map((task) => (
                <li key={task.id} className="flex items-center gap-2">
                  <span className="line-through text-green-500 dark:text-green-400">
                    {task.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {subjects.length === 0 && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            Add subjects above to organize your study tasks.
          </p>
        )}
      </div>
    </div>
  );
}