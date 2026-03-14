'use client'

import { useState, useRef, useCallback } from 'react'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import WordTooltip from './WordTooltip'
import { audioManager } from '@/lib/audio'
import {
  getTranslationFromCache,
  setTranslationCache,
  isWordSaved,
  saveWord,
  addDiscoveredWord,
  incrementSentenceLearned,
} from '@/lib/storage'
import { DailyStats } from '@/lib/types'

interface WordChipProps {
  word: string
  topic: string
  sentenceId: string
  onStatsUpdate: (stats: DailyStats) => void
  onWordSaved: () => void
}

export default function WordChip({
  word,
  topic,
  sentenceId,
  onStatsUpdate,
  onWordSaved,
}: WordChipProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const [hebrew, setHebrew] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [saved, setSaved] = useState(() => isWordSaved(word))
  const chipRef = useRef<HTMLSpanElement>(null)

  // Strip trailing punctuation for the clean word
  const cleanWord = word.replace(/[^\w]/g, '')

  const handleClick = useCallback(async () => {
    if (!cleanWord) return

    setIsTooltipOpen(true)

    // Play word audio (fire and forget — don't block tooltip)
    audioManager.playText(cleanWord, 'word').catch(() => {
      // Silently ignore audio errors — tooltip still shows
    })

    // Track word discovery
    const updatedStats = addDiscoveredWord(cleanWord)
    const withSentence = incrementSentenceLearned(sentenceId)
    onStatsUpdate({ ...updatedStats, ...withSentence })

    // Get translation (check cache first)
    const cached = getTranslationFromCache(cleanWord)
    if (cached) {
      setHebrew(cached)
      return
    }

    setIsTranslating(true)
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: cleanWord }),
      })

      if (response.ok) {
        const data = await response.json()
        setHebrew(data.translation)
        setTranslationCache(cleanWord, data.translation)
      } else {
        setHebrew(null)
      }
    } catch {
      setHebrew(null)
    } finally {
      setIsTranslating(false)
    }
  }, [cleanWord, sentenceId, onStatsUpdate])

  const handleSave = useCallback(() => {
    if (!cleanWord || saved) return
    saveWord({
      english: cleanWord,
      hebrew: hebrew ?? '',
      topic,
    })
    setSaved(true)
    onWordSaved()
  }, [cleanWord, saved, hebrew, topic, onWordSaved])

  const handleClose = useCallback(() => {
    setIsTooltipOpen(false)
  }, [])

  if (!cleanWord) {
    return <>{word}{' '}</>
  }

  return (
    <>
      <span ref={chipRef} className="relative inline-block">
        <span
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
          className={cn(
            'cursor-pointer rounded px-0.5 -mx-0.5 transition-all duration-150',
            'hover:bg-indigo-50 hover:text-indigo-700 hover:underline',
            'focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1',
            isTooltipOpen && 'bg-indigo-50 text-indigo-700',
            'text-gray-800 leading-relaxed'
          )}
          aria-label={`Click to hear and translate: ${cleanWord}`}
        >
          {word}
          {saved && (
            <Bookmark className="inline-block w-2.5 h-2.5 text-indigo-400 ml-0.5 mb-0.5 fill-indigo-400" />
          )}
        </span>

        {isTooltipOpen && (
          <WordTooltip
            word={cleanWord}
            hebrew={hebrew}
            isLoading={isTranslating}
            isSaved={saved}
            onSave={handleSave}
            onClose={handleClose}
          />
        )}
      </span>
      {' '}
    </>
  )
}
