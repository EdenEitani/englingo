'use client'

import { useState, useCallback } from 'react'
import { Play, Square, Loader2 } from 'lucide-react'
import { audioManager } from '@/lib/audio'
import { DailyStats } from '@/lib/types'
import WordChip from './WordChip'

interface StoryParagraphProps {
  text: string
  storyTitle: string        // used as the "topic" for WordChip
  paragraphId: string       // unique id for stats tracking
  index: number             // paragraph number for display
  onStatsUpdate: (stats: DailyStats) => void
  onWordSaved: () => void
}

type AudioState = 'idle' | 'loading' | 'playing'

export default function StoryParagraph({
  text,
  storyTitle,
  paragraphId,
  index,
  onStatsUpdate,
  onWordSaved,
}: StoryParagraphProps) {
  const [audioState, setAudioState] = useState<AudioState>('idle')

  const handlePlay = useCallback(async () => {
    if (audioState === 'loading') return

    if (audioState === 'playing') {
      audioManager.stop()
      setAudioState('idle')
      return
    }

    setAudioState('loading')
    try {
      await audioManager.playText(text, 'sentence', () => setAudioState('idle'))
      setAudioState('playing')
    } catch {
      setAudioState('idle')
    }
  }, [audioState, text])

  const words = text.split(/\s+/).filter(Boolean)

  return (
    <div className="group relative py-3 px-1 rounded-lg hover:bg-gray-50 transition-colors">
      {/* Paragraph number + play button — appears on hover */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5 mt-1">
          <span className="text-xs text-gray-300 font-mono w-5 text-center select-none">
            {index + 1}
          </span>
          <button
            onClick={handlePlay}
            className={`
              w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150
              opacity-0 group-hover:opacity-100 focus:opacity-100
              ${audioState === 'playing'
                ? 'bg-indigo-600 text-white'
                : audioState === 'loading'
                ? 'bg-indigo-100 text-indigo-400 cursor-wait'
                : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100'}
            `}
            aria-label={audioState === 'playing' ? 'Stop' : 'Play paragraph'}
          >
            {audioState === 'loading' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : audioState === 'playing' ? (
              <Square className="w-3 h-3 fill-current" />
            ) : (
              <Play className="w-3 h-3 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Paragraph text with clickable words */}
        <p className="reading-text text-gray-700 leading-8 flex-1">
          {words.map((word, i) => (
            <WordChip
              key={`${paragraphId}-w${i}`}
              word={word}
              topic={storyTitle}
              sentenceId={paragraphId}
              onStatsUpdate={onStatsUpdate}
              onWordSaved={onWordSaved}
            />
          ))}
        </p>
      </div>
    </div>
  )
}
