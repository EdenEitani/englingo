'use client'

import { useState, useCallback } from 'react'
import { Play, Square, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import WordChip from './WordChip'
import { audioManager } from '@/lib/audio'
import { incrementSentenceHeard, incrementSentenceLearned } from '@/lib/storage'
import { GeneratedSentence, DailyStats } from '@/lib/types'

interface SentenceCardProps {
  sentence: GeneratedSentence
  topic: string
  onStatsUpdate: (stats: DailyStats) => void
  onWordSaved: () => void
}

type AudioState = 'idle' | 'loading' | 'playing' | 'done'

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', he: 'מתחיל', color: 'bg-green-100 text-green-700' },
  'easy-intermediate': { label: 'Easy-Int', he: 'קל-בינוני', color: 'bg-yellow-100 text-yellow-700' },
  intermediate: { label: 'Intermediate', he: 'בינוני', color: 'bg-orange-100 text-orange-700' },
}

export default function SentenceCard({
  sentence,
  topic,
  onStatsUpdate,
  onWordSaved,
}: SentenceCardProps) {
  const [audioState, setAudioState] = useState<AudioState>('idle')
  const [hasBeenHeard, setHasBeenHeard] = useState(false)

  const handlePlay = useCallback(async () => {
    if (audioState === 'loading') return

    if (audioState === 'playing') {
      audioManager.stop()
      setAudioState('idle')
      return
    }

    setAudioState('loading')
    try {
      await audioManager.playText(sentence.text, 'sentence', () => {
        // Audio completed
        setAudioState('done')
        setHasBeenHeard(true)
        const statsAfterHeard = incrementSentenceHeard(sentence.id)
        const statsAfterLearned = incrementSentenceLearned(sentence.id)
        onStatsUpdate({ ...statsAfterHeard, ...statsAfterLearned })
      })
      setAudioState('playing')
    } catch {
      setAudioState('idle')
    }
  }, [audioState, sentence.text, sentence.id, onStatsUpdate])

  const difficulty = DIFFICULTY_CONFIG[sentence.difficulty]

  // Tokenize sentence into words (preserving punctuation attached to words)
  const words = sentence.text.split(/\s+/).filter(Boolean)

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-4 sm:p-5 shadow-sm border transition-all duration-300',
        hasBeenHeard ? 'border-green-200 shadow-green-50' : 'border-gray-100',
        'hover:shadow-md'
      )}
    >
      {/* Header: difficulty badge + heard indicator + play button */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              difficulty.color
            )}
          >
            {difficulty.label}
          </span>
          {hasBeenHeard && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Heard
            </span>
          )}
        </div>

        <button
          onClick={handlePlay}
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150',
            audioState === 'playing'
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : audioState === 'loading'
              ? 'bg-indigo-100 text-indigo-400 cursor-wait'
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          )}
          aria-label={
            audioState === 'playing'
              ? 'Stop audio'
              : audioState === 'loading'
              ? 'Loading audio...'
              : 'Play sentence'
          }
        >
          {audioState === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : audioState === 'playing' ? (
            <Square className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Sentence text with clickable words */}
      <div className="text-gray-800 text-base sm:text-lg leading-relaxed font-medium">
        {words.map((word, index) => (
          <WordChip
            key={`${sentence.id}-word-${index}`}
            word={word}
            topic={topic}
            sentenceId={sentence.id}
            onStatsUpdate={onStatsUpdate}
            onWordSaved={onWordSaved}
          />
        ))}
      </div>
    </div>
  )
}
