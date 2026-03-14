'use client'

import { GeneratedSentence, DailyStats } from '@/lib/types'
import SentenceCard from './SentenceCard'
import EmptyState from './EmptyState'

interface SentenceListProps {
  sentences: GeneratedSentence[]
  isLoading: boolean
  topic: string
  error: string | null
  onStatsUpdate: (stats: DailyStats) => void
  onWordSaved: () => void
}

export default function SentenceList({
  sentences,
  isLoading,
  topic,
  error,
  onStatsUpdate,
  onWordSaved,
}: SentenceListProps) {
  if (isLoading) {
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
        <p className="text-red-500 text-sm" dir="rtl">
          אופס! משהו השתבש. נסה שוב.
        </p>
        <p className="text-red-500 text-xs mt-2">{error}</p>
      </div>
    )
  }

  if (sentences.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-500">
          {sentences.length} sentences about{' '}
          <span className="text-indigo-600 font-semibold">&ldquo;{topic}&rdquo;</span>
        </h2>
        <p className="text-xs text-gray-400">Click any word to translate</p>
      </div>

      {sentences.map((sentence) => (
        <SentenceCard
          key={sentence.id}
          sentence={sentence}
          topic={topic}
          onStatsUpdate={onStatsUpdate}
          onWordSaved={onWordSaved}
        />
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
        <div className="h-9 w-9 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  )
}
