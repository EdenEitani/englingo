'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Bookmark } from 'lucide-react'
import { Story } from '@/lib/stories'
import { DailyStats } from '@/lib/types'
import { getDailyStats, getSavedWords } from '@/lib/storage'
import StoryParagraph from '@/components/StoryParagraph'
import ProgressBar from '@/components/ProgressBar'

export default function StoryReaderClient({ story }: { story: Story }) {
  const [dailyStats, setDailyStats] = useState<DailyStats>(() => getDailyStats())
  const [savedWordsCount, setSavedWordsCount] = useState(0)

  useEffect(() => {
    setDailyStats(getDailyStats())
    setSavedWordsCount(getSavedWords().length)
  }, [])

  const handleStatsUpdate = useCallback((stats: DailyStats) => {
    setDailyStats(stats)
  }, [])

  const handleWordSaved = useCallback(() => {
    setSavedWordsCount(getSavedWords().length)
  }, [])

  return (
    <div>
      {/* Daily stats */}
      <ProgressBar stats={dailyStats} />

      {/* Back link */}
      <Link
        href="/stories"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-5 mt-2"
      >
        <ArrowLeft className="w-4 h-4" />
        All Stories
      </Link>

      {/* Story header */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl px-5 py-5 mb-6 border border-indigo-100">
        <div className="flex items-start gap-4">
          <span className="text-5xl" role="img" aria-label={story.title}>
            {story.coverEmoji}
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{story.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{story.author}</p>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{story.description}</p>
            <p className="text-xs text-gray-400 mt-1" dir="rtl">{story.descriptionHe}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-indigo-100">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <BookOpen className="w-3.5 h-3.5" />
            {story.paragraphs.length} paragraphs · ~{story.wordCount} words
          </span>
          {savedWordsCount > 0 && (
            <Link
              href="/saved"
              className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors ml-auto"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {savedWordsCount} saved word{savedWordsCount !== 1 ? 's' : ''}
            </Link>
          )}
        </div>
      </div>

      {/* Reading hint */}
      <p className="text-xs text-gray-400 mb-4 text-center">
        Hover over a paragraph to play it · Click any word for translation
      </p>

      {/* Story content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 divide-y divide-gray-50">
        {story.paragraphs.map((paragraph, index) => (
          <StoryParagraph
            key={index}
            text={paragraph}
            storyTitle={story.title}
            paragraphId={`${story.id}-p${index}`}
            index={index}
            onStatsUpdate={handleStatsUpdate}
            onWordSaved={handleWordSaved}
          />
        ))}
      </div>

      {/* Attribution footer */}
      <p className="text-xs text-gray-300 text-center mt-6">
        Adapted from the original work by {story.author} (public domain)
      </p>
    </div>
  )
}
