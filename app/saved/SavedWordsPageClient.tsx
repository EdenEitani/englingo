'use client'

import { useState, useEffect } from 'react'
import SavedWordsList from '@/components/SavedWordsList'
import { getSavedWords } from '@/lib/storage'
import { SavedWord } from '@/lib/types'

export default function SavedWordsPageClient() {
  const [words, setWords] = useState<SavedWord[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setWords(getSavedWords())
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return (
      <div className="space-y-3 animate-pulse">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl" />
        ))}
      </div>
    )
  }

  return <SavedWordsList initialWords={words} />
}
