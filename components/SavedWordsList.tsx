'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, BookOpen, BookmarkX } from 'lucide-react'
import { SavedWord } from '@/lib/types'
import { removeWord } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface SavedWordsListProps {
  initialWords: SavedWord[]
}

export default function SavedWordsList({ initialWords }: SavedWordsListProps) {
  const [words, setWords] = useState<SavedWord[]>(initialWords)
  const router = useRouter()

  const handleRemove = (id: string) => {
    removeWord(id)
    setWords((prev) => prev.filter((w) => w.id !== id))
  }

  const handlePractice = (word: SavedWord) => {
    router.push(`/?topic=${encodeURIComponent(word.english)}`)
  }

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <BookmarkX className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">No saved words yet</h2>
        <p className="text-gray-400 mb-1">אין מילים שמורות עדיין</p>
        <p className="text-gray-400 text-sm max-w-xs">
          Click on words while practicing to save them here.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Start practicing →
        </button>
      </div>
    )
  }

  // Group by topic
  const grouped = words.reduce<Record<string, SavedWord[]>>((acc, word) => {
    const key = word.topic || 'General'
    if (!acc[key]) acc[key] = []
    acc[key].push(word)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {words.length} saved word{words.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-400">Click a word to practice more sentences</p>
      </div>

      {Object.entries(grouped).map(([topic, topicWords]) => (
        <div key={topic}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-gray-600 capitalize">{topic}</h3>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">{topicWords.length} words</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topicWords.map((word) => (
              <SavedWordCard
                key={word.id}
                word={word}
                onRemove={handleRemove}
                onPractice={handlePractice}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface SavedWordCardProps {
  word: SavedWord
  onRemove: (id: string) => void
  onPractice: (word: SavedWord) => void
}

function SavedWordCard({ word, onRemove, onPractice }: SavedWordCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => onRemove(word.id), 200)
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-4 border border-gray-100 shadow-sm',
        'flex items-center justify-between gap-3',
        'transition-all duration-200',
        isRemoving && 'opacity-0 scale-95'
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 text-base">{word.english}</p>
        {word.hebrew && (
          <p className="text-gray-500 text-sm mt-0.5" dir="rtl" lang="he">
            {word.hebrew}
          </p>
        )}
        <p className="text-gray-400 text-xs mt-1">
          {new Date(word.saved_at).toLocaleDateString('he-IL')}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onPractice(word)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors"
          aria-label={`Practice with word: ${word.english}`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Practice</span>
        </button>
        <button
          onClick={handleRemove}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          aria-label={`Remove saved word: ${word.english}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
