'use client'

import { useState, useCallback, useMemo } from 'react'
import { RotateCcw, Trophy, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SavedWord } from '@/lib/types'

const PAIR_COUNT = 6   // pairs per round

interface MatchGameProps {
  words: SavedWord[]
  onClose: () => void
}

interface Tile {
  id: string        // unique tile id
  pairId: string    // shared between the two tiles of a pair
  text: string
  lang: 'en' | 'he'
  matched: boolean
  flash: 'correct' | 'wrong' | null
}

function buildTiles(pairs: SavedWord[]): { english: Tile[]; hebrew: Tile[] } {
  const shuffleArr = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

  const english: Tile[] = shuffleArr(pairs.map((w) => ({
    id: `en-${w.id}`,
    pairId: w.id,
    text: w.english,
    lang: 'en' as const,
    matched: false,
    flash: null,
  })))

  const hebrew: Tile[] = shuffleArr(pairs.map((w) => ({
    id: `he-${w.id}`,
    pairId: w.id,
    text: w.hebrew || w.english,
    lang: 'he' as const,
    matched: false,
    flash: null,
  })))

  return { english, hebrew }
}

export default function MatchGame({ words, onClose }: MatchGameProps) {
  // Pick PAIR_COUNT random words
  const initialPairs = useMemo(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, PAIR_COUNT)
  }, [words])

  const [english, setEnglish] = useState<Tile[]>(() => buildTiles(initialPairs).english)
  const [hebrew, setHebrew] = useState<Tile[]>(() => buildTiles(initialPairs).hebrew)
  const [selectedEn, setSelectedEn] = useState<string | null>(null)
  const [selectedHe, setSelectedHe] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [matched, setMatched] = useState(0)
  const [finished, setFinished] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const matchedCount = english.filter((t) => t.matched).length

  const handleSelectEn = useCallback((id: string) => {
    if (isChecking) return
    const tile = english.find((t) => t.id === id)
    if (!tile || tile.matched) return
    setSelectedEn(id)
  }, [english, isChecking])

  const handleSelectHe = useCallback((id: string) => {
    if (isChecking) return
    const tile = hebrew.find((t) => t.id === id)
    if (!tile || tile.matched) return
    setSelectedHe(id)

    // Need an english selection too
    if (!selectedEn) return

    const enTile = english.find((t) => t.id === selectedEn)!
    const heTile = hebrew.find((t) => t.id === id)!
    const isMatch = enTile.pairId === heTile.pairId

    setAttempts((a) => a + 1)
    setIsChecking(true)

    if (isMatch) {
      // Flash correct, then mark matched
      setEnglish((prev) => prev.map((t) => t.id === selectedEn ? { ...t, flash: 'correct' } : t))
      setHebrew((prev) => prev.map((t) => t.id === id ? { ...t, flash: 'correct' } : t))
      setTimeout(() => {
        setEnglish((prev) => prev.map((t) => t.id === selectedEn ? { ...t, flash: null, matched: true } : t))
        setHebrew((prev) => prev.map((t) => t.id === id ? { ...t, flash: null, matched: true } : t))
        const newMatched = matchedCount + 1
        setMatched(newMatched)
        if (newMatched >= PAIR_COUNT) setFinished(true)
        setSelectedEn(null)
        setSelectedHe(null)
        setIsChecking(false)
      }, 600)
    } else {
      // Flash wrong, then deselect
      setEnglish((prev) => prev.map((t) => t.id === selectedEn ? { ...t, flash: 'wrong' } : t))
      setHebrew((prev) => prev.map((t) => t.id === id ? { ...t, flash: 'wrong' } : t))
      setTimeout(() => {
        setEnglish((prev) => prev.map((t) => t.id === selectedEn ? { ...t, flash: null } : t))
        setHebrew((prev) => prev.map((t) => t.id === id ? { ...t, flash: null } : t))
        setSelectedEn(null)
        setSelectedHe(null)
        setIsChecking(false)
      }, 700)
    }
  }, [english, hebrew, selectedEn, matchedCount, isChecking])

  const handleRestart = () => {
    const newPairs = [...words].sort(() => Math.random() - 0.5).slice(0, PAIR_COUNT)
    const { english: en, hebrew: he } = buildTiles(newPairs)
    setEnglish(en)
    setHebrew(he)
    setSelectedEn(null)
    setSelectedHe(null)
    setAttempts(0)
    setMatched(0)
    setFinished(false)
    setIsChecking(false)
  }

  const accuracy = attempts > 0 ? Math.round((PAIR_COUNT / attempts) * 100) : 100

  // ── Finished ──────────────────────────────────────────────────────────
  if (finished) {
    const stars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
        <div className="text-5xl mb-3">{'⭐'.repeat(stars)}</div>
        <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{accuracy}% accuracy</h2>
        <p className="text-gray-500 mb-1">{PAIR_COUNT} pairs matched in {attempts} attempts</p>
        <p className="text-sm text-gray-400 mb-6" dir="rtl">
          {accuracy >= 80 ? 'מצוין! כל הכבוד.' : accuracy >= 50 ? 'טוב! המשך להתאמן.' : 'נסה שוב, תשתפר!'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={handleRestart} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors">
            <RotateCcw className="w-4 h-4" /> New round
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
            Done
          </button>
        </div>
      </div>
    )
  }

  // ── Game grid ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>{matchedCount}/{PAIR_COUNT} matched</span>
          {attempts > 0 && <span className="text-xs text-gray-400">· {attempts} attempts</span>}
        </div>
        <p className="text-xs text-gray-400">Match English → Hebrew</p>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* English column */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 text-center mb-2">English</p>
          {english.map((tile) => (
            <TileButton
              key={tile.id}
              tile={tile}
              isSelected={selectedEn === tile.id}
              onClick={() => handleSelectEn(tile.id)}
              dir="ltr"
            />
          ))}
        </div>

        {/* Hebrew column */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-400 text-center mb-2">עברית</p>
          {hebrew.map((tile) => (
            <TileButton
              key={tile.id}
              tile={tile}
              isSelected={selectedHe === tile.id}
              onClick={() => handleSelectHe(tile.id)}
              dir="rtl"
            />
          ))}
        </div>
      </div>

      <button onClick={onClose} className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
        ✕ Exit game
      </button>
    </div>
  )
}

function TileButton({
  tile,
  isSelected,
  onClick,
  dir,
}: {
  tile: Tile
  isSelected: boolean
  onClick: () => void
  dir: 'ltr' | 'rtl'
}) {
  return (
    <button
      onClick={onClick}
      disabled={tile.matched}
      dir={dir}
      className={cn(
        'w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-150 text-center',
        tile.matched
          ? 'bg-green-50 border-green-200 text-green-600 opacity-50 cursor-default'
          : tile.flash === 'correct'
          ? 'bg-green-100 border-green-400 text-green-700 scale-105'
          : tile.flash === 'wrong'
          ? 'bg-red-100 border-red-400 text-red-700 animate-pulse'
          : isSelected
          ? 'bg-indigo-100 border-indigo-500 text-indigo-700 shadow-sm scale-[1.02]'
          : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
      )}
    >
      {tile.text}
    </button>
  )
}
