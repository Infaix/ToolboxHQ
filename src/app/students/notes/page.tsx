"use client";

import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
}

export function useNotes() {
  const { theme } = useTheme();
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('notes-notes');
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
    localStorage.setItem('notes-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = useCallback((title: string, content: string, subject: string) => {
    setNotes(prev => [...prev, {
      id: Date.now().toString(),
      title: title.trim() || 'Untitled',
      content: content.trim(),
      subject: subject.trim() || 'General',
    }]);
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes(prev => prev.filter((n) => n.id !== id));
  }, []);

  const editNote = useCallback((id: string, title: string, content: string, subject: string) => {
    setNotes(prev =>
      prev.map((n) =>
        n.id === id ? { ...n, title: title.trim(), content: content.trim(), subject: subject.trim() } : n
      )
    );
  }, []);

  return {
    notes,
    setNotes,
    addNote,
    removeNote,
    editNote,
  };
}

export default function NotesPage() {
  const { theme } = useTheme();
  const isDark = true; // simplified for this build

  const {
    notes,
    setNotes,
    addNote,
    removeNote,
  } = useNotes();

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
            Notes
          </h1>
        </nav>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Add Note
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Note Title
              </label>
              <input
                type="text"
                placeholder="e.g. Lecture Notes - Week 3"
                className={classes.input}
                aria-label="Note title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Subject
              </label>
              <select className={classes.input}>
                <option value="">Select subject</option>
                <option value="Maths">Maths</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              // Would need state to capture inputs
              alert('Note addition - implement form capture');
            }}
          >
            Add Note
          </button>
        </div>

        {notes.length > 0 && (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="card p-4">
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{note.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{note.subject}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="ghostButton text-sm px-2 py-1"
                      aria-label="Edit note"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ghostButton text-red-500 dark:text-red-400 text-sm px-2 py-1"
                      aria-label="Delete note"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {notes.length === 0 && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            No notes yet. Add a note above to get started.
          </p>
        )}
      </div>
    </div>
  );
}