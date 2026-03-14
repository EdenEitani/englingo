'use client'

import { useState } from 'react'
import { BookOpen, Headphones, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GeneratedSentence, DailyStats } from '@/lib/types'
import SentenceCard from './SentenceCard'
import ClozeCard from './ClozeCard'
import SpeedControl from './SpeedControl'
import FontSizeControl from './FontSizeControl'
import EmptyState from './EmptyState'

type Mode = 'practice' | 'quiz'

interface SentenceListProps {
  sentences: GeneratedSentence[]
  isLoading: boolean
  isLoadingMore?: boolean
  topic: string
  error: string | null
  onStatsUpdate: (stats: DailyStats) => void
  onWordSaved: () => void
  onLoadMore?: () => void
}

function getDistractorPool(sentences: GeneratedSentence[], excludeId: string): string[] {
  const FUNCTION_WORDS = new Set([
    'the','a','an','is','was','are','were','be','been','have','has','had',
    'do','does','did','will','would','should','may','might','must','can','could',
    'to','of','in','on','at','for','with','by','from','and','but','or','not',
    'this','that','i','me','my','we','you','he','she','it','they','what','how',
  ])
  return sentences
    .filter((s) => s.id !== excludeId)
    .flatMap((s) =>
      s.text.split(/\s+/).map((w) => w.replace(/[^\w]/g, '').toLowerCase())
    )
    .filter((w) => w.length > 2 && !FUNCTION_WORDS.has(w))
}

export default function SentenceList({
  sentences,
  isLoading,
  isLoadingMore = false,
  topic,
  error,
  onStatsUpdate,
  onWordSaved,
  onLoadMore,
}: SentenceListProps) {
  const [mode, setMode] = useState<Mode>('practice')

  if (isLoading && sentences.length === 0) {
    return (
      <div className="space-y-4" aria-label="Loading sentences..." aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
        <p className="text-red-700 font-medium mb-1">Oops! Something went wrong.</p>
        <p className="text-red-500 text-sm" dir="rtl">אופס! משהו השתבש. נסה שוב.</p>
        <p className="text-red-500 text-xs mt-2">{error}</p>
      </div>
    )
  }

  if (sentences.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: count + mode toggle + speed */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-sm font-medium text-gray-500">
          {sentences.length} sentences about{' '}
          <span className="text-indigo-600 font-semibold">&ldquo;{topic}&rdquo;</span>
          {isLoading && <span className="text-gray-400"> …</span>}
        </h2>

        <div className="flex items-center gap-3">
          {/* Font size */}
          <FontSizeControl />

          {/* Speed control */}
          <SpeedControl />

          {/* Mode toggle */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setMode('practice')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                mode === 'practice' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
              title="Practice mode: read + click words"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Practice
            </button>
            <button
              onClick={() => setMode('quiz')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                mode === 'quiz' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
              title="Quiz mode: listen and fill the gap"
            >
              <Headphones className="w-3.5 h-3.5" />
              Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Mode hint */}
      {mode === 'quiz' && (
        <p className="text-xs text-purple-600 bg-purple-50 rounded-lg px-3 py-2 text-center">
          🎧 Listen carefully, then pick the missing word · האזן היטב ובחר את המילה החסרה
        </p>
      )}
      {mode === 'practice' && (
        <p className="text-xs text-gray-400 text-right">
          Click any word to translate · <Mic className="inline w-3 h-3" /> to shadow
        </p>
      )}

      {/* Cards */}
      {sentences.map((sentence) =>
        mode === 'quiz' ? (
          <ClozeCard
            key={sentence.id}
            sentence={sentence}
            distractorPool={getDistractorPool(sentences, sentence.id)}
            onStatsUpdate={onStatsUpdate}
          />
        ) : (
          <SentenceCard
            key={sentence.id}
            sentence={sentence}
            topic={topic}
            onStatsUpdate={onStatsUpdate}
            onWordSaved={onWordSaved}
          />
        )
      )}

      {/* Load More */}
      {onLoadMore && !isLoading && sentences.length > 0 && mode === 'practice' && (
        <div className="pt-2 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all',
              isLoadingMore
                ? 'bg-indigo-100 text-indigo-400 cursor-wait'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-sm'
            )}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading…
              </>
            ) : (
              'Load 5 more →'
            )}
          </button>
          {isLoadingMore && (
            <p className="text-xs text-gray-400 mt-1">Generating harder sentences…</p>
          )}
        </div>
      )}
    </div>
  )
}

// Inline Mic import for hint text
function Mic({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
        <div className="flex gap-1.5">
          <div className="h-9 w-9 bg-gray-200 rounded-full" />
          <div className="h-9 w-9 bg-gray-200 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  )
}
