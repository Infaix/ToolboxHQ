"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
}

const NOTES_KEY = 'notes-notes';

function loadNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(NOTES_KEY);
    return stored ? (JSON.parse(stored) as Note[]) : [];
  } catch {
    return [];
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  const addNote = useCallback((title: string, content: string, subject: string) => {
    setNotes((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: title.trim() || 'Untitled',
        content: content.trim(),
        subject: subject.trim() || 'General',
      },
    ]);
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const editNote = useCallback((id: string, title: string, content: string, subject: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, title: title.trim() || 'Untitled', content: content.trim(), subject: subject.trim() || 'General' }
          : n
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

const SUBJECT_OPTIONS = ['Maths', 'Physics', 'Chemistry', 'English', 'Other'];

export default function NotesPage() {
  const { notes, addNote, removeNote, editNote } = useNotes();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const classes = {
    input:
      'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    button:
      'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700',
    ghostButton:
      'inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    card: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
  };

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setContent('');
    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setFormError('Please enter a note title.');
      return;
    }
    if (editingId) {
      editNote(editingId, title, content, subject);
    } else {
      addNote(title, content, subject);
    }
    resetForm();
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setSubject(note.subject);
    setContent(note.content);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            Notes
          </h1>
        </nav>

        <div className={classes.card}>
          <h2 className={`${classes.title} mb-4`}>
            {editingId ? 'Edit Note' : 'Add Note'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="note-title">
                Note Title
              </label>
              <input
                id="note-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lecture Notes - Week 3"
                className={classes.input}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="note-subject">
                Subject
              </label>
              <select
                id="note-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={classes.input}
              >
                <option value="">Select subject</option>
                {SUBJECT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="note-content">
              Content
            </label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Write your notes here..."
              className={classes.input}
            />
          </div>

          {formError && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{formError}</p>}

          <div className="mt-6 flex justify-end gap-2">
            {editingId && (
              <button type="button" onClick={resetForm} className={classes.ghostButton}>
                Cancel
              </button>
            )}
            <button type="button" onClick={handleSubmit} className={classes.button} aria-label={editingId ? 'Save note' : 'Add note'}>
              {editingId ? 'Save Changes' : 'Add Note'}
            </button>
          </div>
        </div>

        {notes.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Your Notes ({notes.length})
            </h2>
            {notes.map((note) => (
              <div key={note.id} className={classes.card}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">{note.title}</h3>
                    <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {note.subject}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">{note.content}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(note)}
                      className={classes.ghostButton}
                      aria-label="Edit note"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNote(note.id)}
                      className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
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
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No notes yet. Add a note above to get started.
          </p>
        )}
      </div>
    </div>
  );
}
