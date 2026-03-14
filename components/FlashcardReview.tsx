'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Volume2, Loader2, Eye, ChevronRight, RotateCcw, CheckCircle2, XCircle, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { audioManager } from '@/lib/audio'
import { SavedWord } from '@/lib/types'

interface FlashcardReviewProps {
  words: SavedWord[]
  onClose: () => void
}

type CardState = 'question' | 'revealed' | 'checked'

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/[^\wא-ת]/g, '')
}

export default function FlashcardReview({ words, onClose }: FlashcardReviewProps) {
  const [index, setIndex] = useState(0)
  const [cardState, setCardState] = useState<CardState>('question')
  const [input, setInput] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing'>('idle')
  const [finished, setFinished] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const current = words[index]

  useEffect(() => {
    if (cardState === 'question') inputRef.current?.focus()
  }, [cardState, index])

  const playAudio = useCallback(async () => {
    if (audioState !== 'idle') return
    setAudioState('loading')
    try {
      await audioManager.playText(current.english, 'word', () => setAudioState('idle'))
      setAudioState('playing')
    } catch {
      setAudioState('idle')
    }
  }, [audioState, current.english])

  const handleCheck = useCallback(() => {
    if (!input.trim()) return
    const correct = normalize(input) === normalize(current.hebrew)
    setIsCorrect(correct)
    setCardState('checked')
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }, [input, current.hebrew])

  const handleReveal = useCallback(() => {
    setCardState('revealed')
    setScore((s) => ({ ...s, total: s.total + 1 }))
  }, [])

  const handleNext = useCallback(() => {
    if (index + 1 >= words.length) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setCardState('question')
    setInput('')
    setIsCorrect(null)
  }, [index, words.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && cardState === 'question') handleCheck()
    if (e.key === 'Enter' && (cardState === 'checked' || cardState === 'revealed')) handleNext()
  }

  const handleRestart = () => {
    setIndex(0)
    setCardState('question')
    setInput('')
    setIsCorrect(null)
    setScore({ correct: 0, total: 0 })
    setFinished(false)
  }

  // ── Finished screen ────────────────────────────────────────────────────
  if (finished) {
    const pct = Math.round((score.correct / score.total) * 100)
    const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : 1
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
        <div className="text-5xl mb-3">{'⭐'.repeat(stars)}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{pct}%</h2>
        <p className="text-gray-500 mb-1">{score.correct} / {words.length} correct</p>
        <p className="text-sm text-gray-400 mb-6" dir="rtl">
          {pct >= 80 ? 'מצוין! המשך כך.' : pct >= 50 ? 'טוב! עוד קצת תרגול.' : 'המשך להתאמן, זה יבוא!'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={handleRestart} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors">
            <RotateCcw className="w-4 h-4" /> Try again
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
            Done
          </button>
        </div>
      </div>
    )
  }

  // ── Card ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{index + 1} / {words.length}</span>
        <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / words.length) * 100}%` }}
          />
        </div>
        <span className="text-green-600 font-medium">{score.correct} ✓</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        {/* English word */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <p className="text-3xl font-bold text-gray-900">{current.english}</p>
          <button
            onClick={playAudio}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0',
              audioState === 'playing' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            )}
            aria-label="Play pronunciation"
          >
            {audioState === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-4">What is the Hebrew translation? / מה התרגום לעברית?</p>

        {/* Input */}
        {cardState === 'question' && (
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="הקלד תרגום..."
            dir="rtl"
            lang="he"
            className="w-full text-center text-lg border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 font-heebo mb-4"
            style={{ fontFamily: 'Heebo, Arial Hebrew, Arial, sans-serif' }}
          />
        )}

        {/* Revealed / checked Hebrew */}
        {(cardState === 'revealed' || cardState === 'checked') && (
          <div className={cn(
            'rounded-xl px-4 py-3 mb-4',
            cardState === 'checked' && isCorrect ? 'bg-green-50 border border-green-200' :
            cardState === 'checked' && !isCorrect ? 'bg-red-50 border border-red-200' :
            'bg-indigo-50 border border-indigo-100'
          )}>
            {cardState === 'checked' && (
              <div className="flex items-center justify-center gap-2 mb-1">
                {isCorrect
                  ? <><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="text-sm text-green-600 font-medium">Correct!</span></>
                  : <><XCircle className="w-4 h-4 text-red-500" /><span className="text-sm text-red-500 font-medium">Not quite</span></>
                }
              </div>
            )}
            <p className="text-2xl font-bold text-gray-800" dir="rtl" lang="he">
              {current.hebrew || '—'}
            </p>
            {cardState === 'checked' && !isCorrect && input && (
              <p className="text-sm text-gray-500 mt-1">You wrote: <span dir="rtl">{input}</span></p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          {cardState === 'question' && (
            <>
              <button
                onClick={handleReveal}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4" /> Reveal
              </button>
              <button
                onClick={handleCheck}
                disabled={!input.trim()}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Check
              </button>
            </>
          )}
          {(cardState === 'checked' || cardState === 'revealed') && (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              autoFocus
            >
              {index + 1 >= words.length ? (
                <><Trophy className="w-4 h-4" /> Finish</>
              ) : (
                <>Next <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
      </div>

      <button onClick={onClose} className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
        ✕ Exit review
      </button>
    </div>
  )
}
