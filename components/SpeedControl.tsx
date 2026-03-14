'use client'

import { useState, useEffect } from 'react'
import { Gauge } from 'lucide-react'
import { cn } from '@/lib/utils'
import { audioManager } from '@/lib/audio'
import { getAudioSpeed, setAudioSpeed } from '@/lib/storage'

const SPEEDS = [
  { value: 0.75, label: '0.75×' },
  { value: 1.0,  label: '1×'    },
  { value: 1.25, label: '1.25×' },
]

export default function SpeedControl() {
  const [speed, setSpeed] = useState(1.0)

  useEffect(() => {
    const saved = getAudioSpeed()
    setSpeed(saved)
    audioManager.playbackRate = saved
  }, [])

  function handleSelect(rate: number) {
    setSpeed(rate)
    audioManager.playbackRate = rate
    setAudioSpeed(rate)
  }

  return (
    <div className="flex items-center gap-1.5">
      <Gauge className="w-3.5 h-3.5 text-gray-400" />
      <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
        {SPEEDS.map((s) => (
          <button
            key={s.value}
            onClick={() => handleSelect(s.value)}
            className={cn(
              'px-2 py-0.5 rounded-md text-xs font-medium transition-all duration-150',
              speed === s.value
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
            aria-label={`Set speed to ${s.label}`}
            aria-pressed={speed === s.value}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
