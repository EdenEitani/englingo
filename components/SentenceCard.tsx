'use client'

import { useState, useCallback, useEffect } from 'react'
import { Play, Square, Loader2, CheckCircle2, Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import WordChip from './WordChip'
import { audioManager } from '@/lib/audio'
import { incrementSentenceHeard, incrementSentenceLearned, incrementSentenceShadowed } from '@/lib/storage'
import { GeneratedSentence, DailyStats } from '@/lib/types'

interface SentenceCardProps {
  sentence: GeneratedSentence
  topic: string
  onStatsUpdate: (stats: DailyStats) => void
  onWordSaved: () => void
}

type AudioState = 'idle' | 'loading' | 'playing' | 'done'
type ShadowState = 'idle' | 'loading' | 'playing' | 'countdown' | 'speak' | 'done'

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', color: 'bg-green-100 text-green-700' },
  'easy-intermediate': { label: 'Easy-Int', color: 'bg-yellow-100 text-yellow-700' },
  intermediate: { label: 'Intermediate', color: 'bg-orange-100 text-orange-700' },
}

export default function SentenceCard({
  sentence,
  topic,
  onStatsUpdate,
  onWordSaved,
}: SentenceCardProps) {
  const [audioState, setAudioState] = useState<AudioState>('idle')
  const [hasBeenHeard, setHasBeenHeard] = useState(false)

  // ── Shadowing state ─────────────────────────────────────────────────────
  const [shadowState, setShadowState] = useState<ShadowState>('idle')
  const [countdown, setCountdown] = useState(3)
  const [hasShadowed, setHasShadowed] = useState(false)

  // Countdown tick
  useEffect(() => {
    if (shadowState !== 'countdown') return
    if (countdown <= 0) {
      setShadowState('speak')
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [shadowState, countdown])

  // Auto-end speak phase after 5 seconds
  useEffect(() => {
    if (shadowState !== 'speak') return
    const t = setTimeout(() => {
      setShadowState('done')
      setHasShadowed(true)
      const updated = incrementSentenceShadowed(sentence.id)
      onStatsUpdate(updated)
    }, 5000)
    return () => clearTimeout(t)
  }, [shadowState, sentence.id, onStatsUpdate])

  // ── Playback ────────────────────────────────────────────────────────────
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

  // ── Shadowing ───────────────────────────────────────────────────────────
  const handleShadow = useCallback(async () => {
    if (shadowState !== 'idle' && shadowState !== 'done') return
    setShadowState('loading')
    setCountdown(3)
    try {
      await audioManager.playText(sentence.text, 'sentence', () => {
        setShadowState('countdown')
        setCountdown(3)
      })
      setShadowState('playing')
    } catch {
      setShadowState('idle')
    }
  }, [shadowState, sentence.text])

  const difficulty = DIFFICULTY_CONFIG[sentence.difficulty]
  const words = sentence.text.split(/\s+/).filter(Boolean)

  return (
    <div className={cn(
      'bg-white rounded-xl p-4 sm:p-5 shadow-sm border transition-all duration-300 hover:shadow-md',
      hasBeenHeard ? 'border-green-200 shadow-green-50' : 'border-gray-100',
    )}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', difficulty.color)}>
            {difficulty.label}
          </span>
          {hasBeenHeard && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Heard
            </span>
          )}
          {hasShadowed && (
            <span className="flex items-center gap-1 text-xs text-purple-600 font-medium">
              <Mic className="w-3.5 h-3.5" />
              Shadowed
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Shadow button */}
          <button
            onClick={handleShadow}
            disabled={shadowState === 'loading' || shadowState === 'playing' || shadowState === 'countdown' || shadowState === 'speak'}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150',
              shadowState === 'speak'
                ? 'bg-purple-600 text-white animate-pulse'
                : shadowState === 'countdown' || shadowState === 'playing'
                ? 'bg-purple-100 text-purple-400'
                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
            )}
            aria-label="Shadow this sentence"
            title="Shadow: listen then say it yourself"
          >
            {shadowState === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Play button */}
          <button
            onClick={handlePlay}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150',
              audioState === 'playing'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : audioState === 'loading'
                ? 'bg-indigo-100 text-indigo-400 cursor-wait'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            )}
            aria-label={audioState === 'playing' ? 'Stop' : 'Play sentence'}
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
      </div>

      {/* Shadowing overlay */}
      {(shadowState === 'countdown' || shadowState === 'speak') && (
        <div className={cn(
          'rounded-lg p-3 mb-3 text-center transition-all',
          shadowState === 'speak' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'
        )}>
          {shadowState === 'countdown' ? (
            <p className="font-bold text-2xl">{countdown}</p>
          ) : (
            <p className="font-semibold text-sm flex items-center justify-center gap-2">
              <Mic className="w-4 h-4 animate-pulse" />
              Say it now! / אמור את זה עכשיו!
            </p>
          )}
        </div>
      )}

      {/* Sentence text with clickable words */}
      <div className="reading-text text-gray-800 leading-relaxed font-medium">
        {words.map((word, index) => (
          <WordChip
            key={`${sentence.id}-word-${index}`}
            word={word}
            topic={topic}
            sentenceId={sentence.id}
            sentenceText={sentence.text}
            onStatsUpdate={onStatsUpdate}
            onWordSaved={onWordSaved}
          />
        ))}
      </div>
    </div>
  )
}
