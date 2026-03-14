'use client'

import { useState, useEffect, useCallback } from 'react'
import { Volume2, Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { audioManager } from '@/lib/audio'
import { incrementSentenceHeard, incrementSentenceLearned } from '@/lib/storage'
import { GeneratedSentence, DailyStats } from '@/lib/types'

// Words too common/short to make interesting cloze targets
const FUNCTION_WORDS = new Set([
  'the','a','an','is','was','are','were','be','been','being','have','has','had',
  'do','does','did','will','would','shall','should','may','might','must','can','could',
  'to','of','in','on','at','for','with','by','from','up','about','into','through',
  'and','but','or','nor','so','yet','not','if','then','there','here','as','than',
  'this','that','these','those','i','me','my','we','our','you','your','he','him',
  'his','she','her','it','its','they','them','their','what','which','who','when',
  'where','why','how','all','some','no','just','very','also','so','too',
])

function getContentWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/[^\w]/g, '').toLowerCase())
    .filter((w) => w.length > 2 && !FUNCTION_WORDS.has(w))
}

function pickTargetWord(sentence: string): { word: string; cleanWord: string; index: number } | null {
  const words = sentence.split(/\s+/)
  // Shuffle indices and pick first content word
  const indices = [...Array(words.length).keys()].sort(() => Math.random() - 0.5)
  for (const i of indices) {
    const clean = words[i].replace(/[^\w]/g, '').toLowerCase()
    if (clean.length > 2 && !FUNCTION_WORDS.has(clean)) {
      return { word: words[i], cleanWord: clean, index: i }
    }
  }
  return null
}

function buildOptions(correct: string, pool: string[]): string[] {
  const distractors = pool
    .filter((w) => w !== correct && w.length > 2)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)

  // Pad with fallbacks if pool is small
  const fallbacks = ['wonderful', 'quickly', 'beautiful', 'important', 'different', 'special']
  while (distractors.length < 2) {
    const f = fallbacks.find((w) => w !== correct && !distractors.includes(w))
    if (f) distractors.push(f)
    else break
  }

  return [correct, ...distractors].sort(() => Math.random() - 0.5)
}

interface ClozeCardProps {
  sentence: GeneratedSentence
  distractorPool: string[]   // content words from other sentences
  onStatsUpdate: (stats: DailyStats) => void
}

type CardState = 'loading' | 'ready' | 'answered' | 'replaying'

export default function ClozeCard({ sentence, distractorPool, onStatsUpdate }: ClozeCardProps) {
  const target = pickTargetWord(sentence.text)
  const options = target ? buildOptions(target.cleanWord, distractorPool) : []

  const [cardState, setCardState] = useState<CardState>('loading')
  const [chosen, setChosen] = useState<string | null>(null)
  const [replayState, setReplayState] = useState<'idle' | 'loading' | 'playing'>('idle')

  // Auto-play the sentence when the card mounts
  useEffect(() => {
    let cancelled = false
    audioManager.playText(sentence.text, 'sentence', () => {
      if (!cancelled) setCardState('ready')
    }).then(() => {
      if (!cancelled) setCardState('ready')
    }).catch(() => {
      if (!cancelled) setCardState('ready')
    })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence.id])

  const handleAnswer = useCallback((option: string) => {
    if (cardState !== 'ready') return
    setChosen(option)
    setCardState('answered')
    const statsHeard = incrementSentenceHeard(sentence.id)
    const statsLearned = incrementSentenceLearned(sentence.id)
    onStatsUpdate({ ...statsHeard, ...statsLearned })
  }, [cardState, sentence.id, onStatsUpdate])

  const handleReplay = useCallback(async () => {
    if (replayState !== 'idle') return
    setReplayState('loading')
    try {
      await audioManager.playText(sentence.text, 'sentence', () => setReplayState('idle'))
      setReplayState('playing')
    } catch {
      setReplayState('idle')
    }
  }, [replayState, sentence.text])

  const handleReset = useCallback(() => {
    setChosen(null)
    setCardState('loading')
    audioManager.playText(sentence.text, 'sentence', () => setCardState('ready'))
      .then(() => setCardState('ready'))
      .catch(() => setCardState('ready'))
  }, [sentence.text])

  if (!target) return null

  // Build sentence with blank
  const words = sentence.text.split(/\s+/)
  const isCorrect = chosen === target.cleanWord

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
          Fill the Gap
        </span>
        <div className="flex items-center gap-2">
          {cardState === 'answered' && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
              aria-label="Try again"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          )}
          <button
            onClick={handleReplay}
            disabled={replayState === 'loading' || cardState === 'loading'}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-all',
              replayState === 'playing' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
              (replayState === 'loading' || cardState === 'loading') && 'opacity-50 cursor-wait'
            )}
            aria-label="Replay sentence"
          >
            {replayState === 'loading' || cardState === 'loading' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Sentence with blank */}
      <p className="text-gray-800 text-base sm:text-lg leading-relaxed font-medium mb-5">
        {words.map((w, i) => {
          if (i === target.index) {
            if (cardState === 'answered') {
              return (
                <span key={i}>
                  <span className={cn(
                    'inline-block px-2 py-0.5 rounded font-bold mx-0.5',
                    isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  )}>
                    {target.word}
                  </span>{' '}
                </span>
              )
            }
            return (
              <span key={i}>
                <span className="inline-block w-20 h-6 bg-indigo-100 rounded mx-1 align-middle border-b-2 border-indigo-400" />
                {' '}
              </span>
            )
          }
          return <span key={i}>{w}{' '}</span>
        })}
      </p>

      {/* Loading hint */}
      {cardState === 'loading' && (
        <p className="text-xs text-indigo-500 text-center mb-3 animate-pulse">
          🔊 Listen carefully…
        </p>
      )}

      {/* Options */}
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const isChosen = chosen === option
          const correct = option === target.cleanWord

          let btnStyle = 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
          if (cardState === 'answered') {
            if (correct) btnStyle = 'bg-green-50 text-green-700 border-green-300'
            else if (isChosen) btnStyle = 'bg-red-50 text-red-700 border-red-300'
            else btnStyle = 'bg-gray-50 text-gray-400 border-gray-200 opacity-60'
          }

          return (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              disabled={cardState !== 'ready'}
              className={cn(
                'py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-150 flex items-center justify-center gap-1.5',
                btnStyle,
                cardState === 'ready' && 'cursor-pointer',
                cardState !== 'ready' && 'cursor-default'
              )}
            >
              {cardState === 'answered' && correct && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
              {cardState === 'answered' && isChosen && !correct && <XCircle className="w-3.5 h-3.5 flex-shrink-0" />}
              {option}
            </button>
          )
        })}
      </div>

      {/* Result message */}
      {cardState === 'answered' && (
        <p className={cn(
          'text-xs text-center mt-3 font-medium',
          isCorrect ? 'text-green-600' : 'text-red-500'
        )}>
          {isCorrect ? '✓ Correct! Great listening.' : `✗ The word was "${target.cleanWord}"`}
        </p>
      )}
    </div>
  )
}
