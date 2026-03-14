'use client'

import { useState, useEffect } from 'react'
import { List, CreditCard, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'
import SavedWordsList from '@/components/SavedWordsList'
import FlashcardReview from '@/components/FlashcardReview'
import MatchGame from '@/components/MatchGame'
import { getSavedWords } from '@/lib/storage'
import { SavedWord } from '@/lib/types'

type Tab = 'list' | 'flashcards' | 'match'

const MATCH_MIN = 10  // require at least this many saved words for the match game

export default function SavedWordsPageClient() {
  const [words, setWords] = useState<SavedWord[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [tab, setTab] = useState<Tab>('list')

  useEffect(() => {
    setWords(getSavedWords())
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return (
      <div className="space-y-3 animate-pulse">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl" />
        ))}
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; disabled?: boolean; tooltip?: string }[] = [
    { id: 'list',       label: 'Words',      icon: <List className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <CreditCard className="w-4 h-4" />, disabled: words.length === 0, tooltip: 'Save some words first' },
    { id: 'match',      label: 'Match',      icon: <Shuffle className="w-4 h-4" />,    disabled: words.length < MATCH_MIN, tooltip: `Save ${MATCH_MIN}+ words to unlock` },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => !t.disabled && setTab(t.id)}
            title={t.disabled ? t.tooltip : undefined}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              tab === t.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : t.disabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t.icon}
            {t.label}
            {t.id === 'match' && words.length < MATCH_MIN && words.length > 0 && (
              <span className="text-xs text-gray-300 ml-0.5">({words.length}/{MATCH_MIN})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'list' && (
        <SavedWordsList initialWords={words} />
      )}

      {tab === 'flashcards' && words.length > 0 && (
        <FlashcardReview
          words={words}
          onClose={() => setTab('list')}
        />
      )}

      {tab === 'match' && words.length >= MATCH_MIN && (
        <MatchGame
          words={words}
          onClose={() => setTab('list')}
        />
      )}
    </div>
  )
}
