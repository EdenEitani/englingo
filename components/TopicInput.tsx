'use client'

import { useState, KeyboardEvent } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopicInputProps {
  onGenerate: (topic: string) => void
  isLoading: boolean
  initialTopic?: string
}

const SUGGESTIONS = ['travel', 'food', 'sports', 'business', 'health', 'technology', 'movies', 'music']

export default function TopicInput({ onGenerate, isLoading, initialTopic = '' }: TopicInputProps) {
  const [topic, setTopic] = useState(initialTopic)

  const handleGenerate = () => {
    const trimmed = topic.trim()
    if (!trimmed || isLoading) return
    onGenerate(trimmed)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleGenerate()
  }

  return (
    <div className="mb-8">
      <div className="flex gap-3 mb-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a topic... (e.g. travel, food, sports)"
            maxLength={100}
            disabled={isLoading}
            className={cn(
              'w-full px-4 py-3 rounded-xl border border-gray-200 bg-white',
              'text-gray-800 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              'transition-all duration-200',
              'text-sm sm:text-base',
              isLoading && 'opacity-60 cursor-not-allowed'
            )}
            aria-label="Topic for English practice sentences"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || isLoading}
          className={cn(
            'flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm sm:text-base',
            'bg-indigo-600 text-white',
            'hover:bg-indigo-700 active:bg-indigo-800',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            'shadow-sm hover:shadow-md',
            'whitespace-nowrap'
          )}
          aria-label="Generate practice sentences"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-gray-400 self-center">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setTopic(s)
              onGenerate(s)
            }}
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 rounded-full border border-gray-200 hover:border-indigo-200 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
