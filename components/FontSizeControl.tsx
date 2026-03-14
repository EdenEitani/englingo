'use client'

import { useState, useEffect } from 'react'
import { Type } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getFontSize, setFontSize, FontSize } from '@/lib/storage'

const SIZES: { value: FontSize; label: string; cssValue: string }[] = [
  { value: 'sm', label: 'A',  cssValue: '0.875rem' },
  { value: 'md', label: 'A',  cssValue: '1rem'     },
  { value: 'lg', label: 'A',  cssValue: '1.25rem'  },
]

export default function FontSizeControl() {
  const [size, setSize] = useState<FontSize>('md')

  useEffect(() => {
    const saved = getFontSize()
    setSize(saved)
    document.documentElement.style.setProperty('--reading-font-size', SIZES.find(s => s.value === saved)!.cssValue)
  }, [])

  function handleSelect(s: FontSize) {
    const entry = SIZES.find(x => x.value === s)!
    setSize(s)
    setFontSize(s)
    document.documentElement.style.setProperty('--reading-font-size', entry.cssValue)
  }

  return (
    <div className="flex items-center gap-1.5">
      <Type className="w-3.5 h-3.5 text-gray-400" />
      <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
        {SIZES.map((s, i) => (
          <button
            key={s.value}
            onClick={() => handleSelect(s.value)}
            className={cn(
              'px-2 py-0.5 rounded-md font-medium transition-all duration-150',
              // Progressive font sizes for the button labels
              i === 0 ? 'text-xs' : i === 1 ? 'text-sm' : 'text-base',
              size === s.value
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
            aria-label={`Font size: ${s.value}`}
            aria-pressed={size === s.value}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
