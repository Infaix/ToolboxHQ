"use client";

import { useState, useEffect, useCallback } from 'react';
import { useContext } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

interface FlashcardDeck {
  id: string;
  name: string;
  icon?: string;
  cards: Flashcard[];
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  known: boolean;
}

export function useFlashcards() {
  const { theme } = useTheme();
  const [decks, setDecks] = useState<FlashcardDeck[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('flashcards-decks');
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
    localStorage.setItem('flashcards-decks', JSON.stringify(decks));
  }, [decks]);

  const currentDeckId = typeof window === 'undefined' ? null : localStorage.getItem('current-flashcard-deck');

  const currentDeck = decks.find((d) => d.id === currentDeckId);

  const setCurrentDeck = (id: string | null) => {
    localStorage.setItem('current-flashcard-deck', id ?? '');
  };

  const addDeck = useCallback(() => {
    const newDeck: FlashcardDeck = {
      id: Date.now().toString(),
      name: 'New Deck',
      icon: '🃏',
      cards: [],
    };
    setDecks(prev => [...prev, newDeck]);
    setCurrentDeck(newDeck.id);
  }, []);

  const removeDeck = useCallback((id: string) => {
    setDecks(prev => prev.filter((d) => d.id !== id));
    if (currentDeckId === id) setCurrentDeck(null);
  }, [currentDeckId]);

  const selectDeck = useCallback((id: string) => {
    setCurrentDeck(id);
  }, []);

  const addCard = useCallback(() => {
    if (!currentDeck) return;
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: 'Front',
      back: 'Back',
      known: false,
    };
    setDecks(prev => {
      if (currentDeckId) {
        return prev.map((d) =>
          d.id === currentDeckId ? { ...d, cards: [...d.cards, newCard] } : d
        );
      }
      return prev;
    });
  }, [currentDeck]);

  const removeCard = useCallback((deckId: string, cardId: string) => {
    setDecks(prev =>
      prev.map((d) =>
        d.id === deckId ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) } : d
      )
    );
  }, [currentDeckId]);

  const toggleKnown = useCallback((deckId: string, cardId: string) => {
    setDecks(prev =>
      prev.map((d) => {
        if (d.id === deckId) {
          return {
            ...d,
            cards: d.cards.map((c) =>
              c.id === cardId ? { ...c, known: !c.known } : c
            )
          };
        }
        return d;
      })
    );
  }, [currentDeckId]);

  const nextCard = useCallback(() => {
    if (!currentDeck) return;
    const cards = currentDeck.cards.filter((c) => !c.known);
    if (cards.length > 0) {
      // Stay on current card index
    }
  }, [currentDeckId]);

  const prevCard = useCallback(() => {
    if (!currentDeck) return;
  }, [currentDeckId]);

  return {
    decks,
    setDecks,
    currentDeck,
    setCurrentDeck,
    addDeck,
    removeDeck,
    selectDeck,
    addCard,
    removeCard,
    toggleKnown,
    nextCard,
    prevCard,
  };
}

export default function FlashcardsPage() {
  const { decks, setDecks, currentDeck, setCurrentDeck, addDeck, removeDeck, selectDeck, addCard, removeCard, toggleKnown, nextCard, prevCard } = useFlashcards();

  const hasDeck = currentDeck && currentDeck.cards.length > 0;
  const displayCard = hasDeck ? currentDeck.cards[0] : null;

  // Pre-compute all conditional content OUTSIDE JSX return
  let mainContent = null;
  let cardDetails = null;
  let noDeckMsg = null;
  let deckGrid = null;
  let noDecksMsg = null;

  if (currentDeck && displayCard) {
    mainContent = (
      <div className="mb-8">
        <div className="rounded-xl border bg-white p-6">
          <div className="h-64 w-full rounded-xl border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 transition-colors">
              <div className="relative pt-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl font-bold">
                    {displayCard.front?.charAt(0) || '?'}
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">
                    {currentDeck.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {currentDeck.cards.length} cards
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/20 p-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {displayCard.front || 'Flip cards'}
                  </p>
                  <p className="text-xs text-gray-500">Front</p>
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-gray-900">
                    {displayCard.back || '?'}
                  </p>
                  <p className="text-xs text-gray-500">Back</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    if (displayCard !== null) {
      cardDetails = (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">
              Card {currentDeck.cards.indexOf(displayCard) + 1} of {currentDeck.cards.length}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Front</h3>
              <p className="text-lg text-gray-600">
                {displayCard.front || 'Flip cards'}
              </p>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Back</h3>
              <p className="text-lg text-gray-600">
                {displayCard.back || '?'}
              </p>
              <p className="text-sm text-gray-500">
                Known: {displayCard.known ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => toggleKnown(currentDeck.id, displayCard.id)}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            >
              Known
            </button>
            <button
              type="button"
              onClick={() => nextCard()}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
              aria-label="Next"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => prevCard()}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
              aria-label="Prev"
            >
              Prev
            </button>
          </div>
        </div>
      );
    }
  } else {
    noDeckMsg = (
      <p className="mb-8 text-sm text-center text-gray-500">
        Create a deck above to start studying.
      </p>
    );
  }

  if (decks.length > 0) {
    deckGrid = (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="rounded-xl border bg-white p-5 cursor-pointer hover:border-blue-300 transition"
            onClick={() => selectDeck(deck.id)}
          >
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-2 text-2xl opacity-90">
              {deck.icon}
            </div>
            <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
              {deck.name}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1">
              {deck.cards.length} cards
            </p>
          </div>
        ))}
      </div>
    );
  } else {
    noDecksMsg = (
      <p className="mt-8 text-center text-sm text-gray-500">
        Create a deck above to start studying with flashcards.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <nav className="mb-6 border-b border-gray-300 pb-4">
          <a
            href="/students"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
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
          </a>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
            Flashcards
          </h1>
        </nav>

        {mainContent}

        {cardDetails}

        {noDeckMsg}

        {deckGrid}

        {noDecksMsg}

        <footer className="mt-8 pt-8 border-t border-gray-300 text-center text-sm text-gray-500">
          <p>
            All flashcard data is stored locally in your browser. No account or cloud sync required.
          </p>
        </footer>
      </div>
    </div>
  );
}