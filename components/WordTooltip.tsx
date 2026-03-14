'use client'

import { useEffect, useRef } from 'react'
import { Bookmark, BookmarkCheck, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WordTooltipProps {
  word: string
  hebrew: string | null
  isLoading: boolean
  isSaved: boolean
  onSave: () => void
  onClose: () => void
}

export default function WordTooltip({
  word,
  hebrew,
  isLoading,
  isSaved,
  onSave,
  onClose,
}: WordTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  return (
    <div
      ref={tooltipRef}
      className={cn(
        'absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2',
        'bg-white rounded-xl shadow-xl border border-gray-100',
        'p-3 min-w-[140px] max-w-[200px]',
        'animate-in fade-in zoom-in-95 duration-150'
      )}
      role="tooltip"
      aria-live="polite"
    >
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2">
        <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-gray-100" style={{ marginTop: '-7px' }} />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close tooltip"
      >
        <X className="w-3 h-3" />
      </button>

      {/* English word */}
      <p className="text-gray-500 text-xs mb-1 pr-4">{word}</p>

      {/* Hebrew translation */}
      <div className="mb-3 min-h-[28px] flex items-center">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
        ) : hebrew ? (
          <p className="text-gray-800 font-bold text-lg leading-tight" dir="rtl" lang="he">
            {hebrew}
          </p>
        ) : (
          <p className="text-gray-400 text-xs italic">Translation unavailable</p>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={isSaved}
        className={cn(
          'flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
          isSaved
            ? 'bg-green-50 text-green-600 cursor-default'
            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
        )}
        aria-label={isSaved ? 'Word already saved' : 'Save word to vocabulary'}
      >
        {isSaved ? (
          <>
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Saved</span>
          </>
        ) : (
          <>
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save word</span>
          </>
        )}
      </button>
    </div>
  )
}
