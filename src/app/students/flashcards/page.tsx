"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  known: boolean;
}

interface FlashcardDeck {
  id: string;
  name: string;
  icon: string;
  cards: Flashcard[];
}

const DECKS_KEY = 'flashcards-decks';
const CURRENT_DECK_KEY = 'current-flashcard-deck';

function loadDecks(): FlashcardDeck[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(DECKS_KEY);
    return stored ? (JSON.parse(stored) as FlashcardDeck[]) : [];
  } catch {
    return [];
  }
}

function saveDecks(decks: FlashcardDeck[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
  } catch {
    // storage unavailable
  }
}

function loadCurrentDeckId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_DECK_KEY);
}

function saveCurrentDeckId(id: string | null) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CURRENT_DECK_KEY, id || '');
  } catch {
    // storage unavailable
  }
}

export function useFlashcards() {
  const [decks, setDecks] = useState<FlashcardDeck[]>(loadDecks);
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(loadCurrentDeckId);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    saveDecks(decks);
  }, [decks]);

  useEffect(() => {
    if (currentDeckId) {
      saveCurrentDeckId(currentDeckId);
    } else {
      saveCurrentDeckId(null);
    }
  }, [currentDeckId]);

  const currentDeck = decks.find((d) => d.id === currentDeckId) ?? null;

  const setCurrentDeck = useCallback((id: string | null) => {
    setCurrentDeckId(id);
    setCardIndex(0);
    setFlipped(false);
  }, []);

  const selectDeck = useCallback((id: string) => {
    setCurrentDeckId(id);
    setCardIndex(0);
    setFlipped(false);
  }, []);

  const addDeck = useCallback(() => {
    const newDeck: FlashcardDeck = {
      id: Date.now().toString(),
      name: 'New Deck',
      icon: '🃏',
      cards: [],
    };
    setDecks((prev) => [...prev, newDeck]);
    setCurrentDeckId(newDeck.id);
    setCardIndex(0);
    setFlipped(false);
  }, []);

  const removeDeck = useCallback((id: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== id));
    setCurrentDeckId((prev) => (prev === id ? null : prev));
    setCardIndex(0);
    setFlipped(false);
  }, []);

  const renameDeck = useCallback((id: string, newName: string) => {
    setDecks((prev) =>
      prev.map((d) => (d.id === id ? { ...d, name: newName.trim() || 'New Deck' } : d))
    );
  }, []);

  const addCard = useCallback((front: string, back: string) => {
    if (!currentDeckId) return;
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: front || 'Front',
      back: back || 'Back',
      known: false,
    };
    setDecks((prev) =>
      prev.map((d) =>
        d.id === currentDeckId ? { ...d, cards: [...d.cards, newCard] } : d
      )
    );
    setCardIndex((prev) => {
      const deck = decks.find((d) => d.id === currentDeckId);
      if (!deck) return prev;
      return Math.max(0, Math.min(deck.cards.length, prev));
    });
    setFlipped(false);
  }, [currentDeckId, decks]);

  const removeCard = useCallback((deckId: string, cardId: string) => {
    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId
          ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) }
          : d
      )
    );
    setCardIndex(0);
    setFlipped(false);
  }, []);

  const toggleKnown = useCallback((deckId: string, cardId: string) => {
    setDecks((prev) =>
      prev.map((d) => {
        if (d.id !== deckId) return d;
        return {
          ...d,
          cards: d.cards.map((c) =>
            c.id === cardId ? { ...c, known: !c.known } : c
          ),
        };
      })
    );
    setCardIndex(0);
    setFlipped(false);
  }, []);

  const goToCard = useCallback((index: number) => {
    setFlipped(false);
    setCardIndex((prev) => {
      if (!currentDeck || currentDeck.cards.length === 0) return prev;
      return Math.max(0, Math.min(currentDeck.cards.length - 1, index));
    });
  }, [currentDeck]);

  const nextCard = useCallback(() => {
    if (!currentDeck || currentDeck.cards.length === 0) return;
    setCardIndex((prev) => (prev + 1) % currentDeck.cards.length);
    setFlipped(false);
  }, [currentDeck]);

  const prevCard = useCallback(() => {
    if (!currentDeck || currentDeck.cards.length === 0) return;
    setCardIndex((prev) => (prev - 1 + currentDeck.cards.length) % currentDeck.cards.length);
    setFlipped(false);
  }, [currentDeck]);

  const toggleFlip = useCallback(() => {
    setFlipped((f) => !f);
  }, []);

  const shuffleDeck = useCallback(() => {
    if (!currentDeck || currentDeck.cards.length <= 1) return;
    const shuffled = [...currentDeck.cards].sort(() => Math.random() - 0.5);
    setDecks((prev) =>
      prev.map((d) =>
        d.id === currentDeckId ? { ...d, cards: shuffled } : d
      )
    );
  }, [currentDeck]);

  const restartDeck = useCallback(() => {
    setCardIndex(0);
    setFlipped(false);
  }, []);

  const knownCount = currentDeck
    ? currentDeck.cards.filter((c) => c.known).length
    : 0;

  const displayCard = currentDeck && currentDeck.cards.length > 0
    ? currentDeck.cards[cardIndex % currentDeck.cards.length]
    : null;

  return {
    decks,
    setDecks,
    currentDeck,
    setCurrentDeck,
    selectDeck,
    addDeck,
    removeDeck,
    renameDeck,
    addCard,
    removeCard,
    toggleKnown,
    nextCard,
    prevCard,
    toggleFlip,
    shuffleDeck,
    restartDeck,
    cardIndex,
    goToCard,
    flipped,
    displayCard,
    knownCount,
    currentDeckId,
  };
}

export default function FlashcardsPage() {
  const {
    decks,
    currentDeck,
    addDeck,
    removeDeck,
    renameDeck,
    selectDeck,
    addCard,
    removeCard,
    toggleKnown,
    nextCard,
    prevCard,
    toggleFlip,
    shuffleDeck,
    restartDeck,
    cardIndex,
    goToCard,
    flipped,
    displayCard,
    knownCount,
    currentDeckId,
  } = useFlashcards();

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editingDeckName, setEditingDeckName] = useState('');

  const classes = {
    input:
      'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
    ghostButton:
      'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    button:
      'inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700',
    card: 'rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
    title: 'text-xl font-bold text-gray-900 dark:text-white',
  };

  const handleAddCard = () => {
    addCard(front.trim(), back.trim());
    setFront('');
    setBack('');
    setShowAddCard(false);
  };

  const handleRenameDeck = () => {
    if (editingDeckId && editingDeckName.trim()) {
      renameDeck(editingDeckId, editingDeckName.trim());
      setEditingDeckId(null);
      setEditingDeckName('');
    }
  };

  // Confirm delete deck
  const confirmDeleteDeck = (deckId: string) => {
    if (window.confirm('Are you sure you want to delete this deck? This cannot be undone.')) {
      removeDeck(deckId);
    }
  };

  // Confirm delete card
  const confirmDeleteCard = (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this card? This cannot be undone.')) {
      removeCard(currentDeckId || '', cardId);
    }
  };

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
              Flashcards
            </h1>
            <button
              type="button"
              onClick={addDeck}
              className={classes.ghostButton}
            >
              + New deck
            </button>
          </div>
        </nav>

        {currentDeck && displayCard ? (
          <section className="mx-auto max-w-2xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                {editingDeckId === currentDeck.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingDeckName}
                      onChange={(e) => setEditingDeckName(e.target.value)}
                      className={classes.input}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleRenameDeck}
                      className={classes.button}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDeckId(null);
                        setEditingDeckName('');
                      }}
                      className={classes.ghostButton}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    {currentDeck.icon} {currentDeck.name}
                  </h2>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Card {cardIndex + 1} of {currentDeck.cards.length} · {knownCount} known
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCard((s) => !s)}
                  className={classes.ghostButton}
                >
                  + Add card
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDeckId(currentDeck.id);
                    setEditingDeckName(currentDeck.name);
                  }}
                  className={classes.ghostButton}
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeleteDeck(currentDeck.id)}
                  className="inline-flex items-center justify-center rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Delete deck
                </button>
              </div>
            </div>

            {showAddCard && (
              <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="card-front">
                      Front
                    </label>
                    <textarea
                      id="card-front"
                      value={front}
                      onChange={(e) => setFront(e.target.value)}
                      rows={2}
                      className={classes.input}
                      placeholder="Question or prompt"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400" htmlFor="card-back">
                      Back
                    </label>
                    <textarea
                      id="card-back"
                      value={back}
                      onChange={(e) => setBack(e.target.value)}
                      rows={2}
                      className={classes.input}
                      placeholder="Answer"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddCard(false)} className={classes.ghostButton}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCard}
                    className={classes.button}
                  >
                    Save card
                  </button>
                </div>
              </div>
            )}

            <div
              role="button"
              tabIndex={0}
              onClick={toggleFlip}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFlip();
                }
              }}
              className="min-h-72 w-full cursor-pointer select-none rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                {flipped ? 'Back' : 'Front'}
              </p>
              <p className="text-2xl font-medium leading-snug text-gray-900 dark:text-white">
                {flipped ? displayCard?.back : displayCard?.front}
              </p>
              <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
                Click the card to flip
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={prevCard}
                className={classes.ghostButton}
                aria-label="Previous card"
              >
                ‹ Prev
              </button>
              <button
                type="button"
                onClick={toggleFlip}
                className={classes.ghostButton}
                aria-label="Flip card"
              >
                Flip
              </button>
              <button
                type="button"
                onClick={() => toggleKnown(currentDeckId || '', displayCard?.id)}
                className={displayCard?.known
                  ? 'inline-flex items-center justify-center rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-colors dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'}
                aria-pressed={displayCard?.known}
              >
                {displayCard?.known ? 'Known ✓' : 'Mark known'}
              </button>
              <button
                type="button"
                onClick={nextCard}
                className={classes.ghostButton}
                aria-label="Next card"
              >
                Next ›
              </button>
              {currentDeck.cards.length > 1 && (
                <button
                  type="button"
                  onClick={shuffleDeck}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  aria-label="Shuffle deck"
                >
                  Shuffle
                </button>
              )}
              {currentDeck.cards.length > 0 && (
                <button
                  type="button"
                  onClick={restartDeck}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  aria-label="Restart deck"
                >
                  Restart
                </button>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => removeCard(currentDeckId || '', displayCard?.id)}
                className="text-sm text-red-500 transition-colors hover:text-red-700 dark:hover:text-red-400"
              >
                Delete this card
              </button>
            </div>
          </section>
        ) : (
          <section>
            <p className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {currentDeck
                ? 'This deck is empty. Add a card to start studying.'
                : 'Create a deck above to start studying.'}
            </p>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Your decks</h2>
          {decks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {decks.map((deck) => (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => selectDeck(deck.id)}
                  className={`rounded-xl border bg-white p-5 text-left transition ${
                    currentDeck?.id === deck.id
                      ? 'border-blue-500 ring-1 ring-blue-500'
                      : 'hover:border-blue-300 dark:bg-gray-800'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-2xl opacity-90">{deck.icon}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {deck.cards.filter((c) => c.known).length}/{deck.cards.length} known
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{deck.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{deck.cards.length} cards</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              No decks yet. Click "New deck" to create your first set.
            </p>
          )}
        </section>

        <footer className="mt-10 border-t border-gray-200 pt-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <p>All flashcard data is stored locally in your browser. No account or cloud sync required.</p>
        </footer>
      </div>
    </div>
  );
}