'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TopicInput from '@/components/TopicInput'
import SentenceList from '@/components/SentenceList'
import ProgressBar from '@/components/ProgressBar'
import { GeneratedSentence, DailyStats } from '@/lib/types'
import { getDailyStats, getSavedWords } from '@/lib/storage'

function PracticePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [topic, setTopic] = useState('')
  const [sentences, setSentences] = useState<GeneratedSentence[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats>(() => getDailyStats())
  const [savedWordsCount, setSavedWordsCount] = useState(0)

  // Load initial data from localStorage on mount
  useEffect(() => {
    setDailyStats(getDailyStats())
    setSavedWordsCount(getSavedWords().length)
  }, [])

  const handleGenerate = useCallback(async (topicToGenerate: string) => {
    if (!topicToGenerate.trim()) return

    setIsGenerating(true)
    setError(null)
    setSentences([])
    setTopic(topicToGenerate)

    try {
      const savedWords = getSavedWords().map((w) => w.english)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToGenerate,
          savedWords: savedWords.slice(0, 10),
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Failed to generate sentences')
      }

      // Read the JSONL stream — each line is one sentence, add it immediately
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const parsed = JSON.parse(line)
            if (parsed.__error) throw new Error(parsed.__error)
            setSentences((prev) => [...prev, parsed])
          } catch (e) {
            if (e instanceof Error && e.message !== 'Unexpected end of JSON input') throw e
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  // Handle topic from URL param (e.g., from Saved Words "Practice" button)
  useEffect(() => {
    const topicParam = searchParams.get('topic')
    if (topicParam) {
      setTopic(topicParam)
      handleGenerate(topicParam)
      router.replace('/')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStatsUpdate = useCallback((stats: DailyStats) => {
    setDailyStats(stats)
  }, [])

  const handleWordSaved = useCallback(() => {
    setSavedWordsCount(getSavedWords().length)
  }, [])

  return (
    <>
      {/* Daily progress stats */}
      <ProgressBar stats={dailyStats} />

      {/* Topic input */}
      <TopicInput
        onGenerate={handleGenerate}
        isLoading={isGenerating}
        initialTopic={topic}
      />

      {/* Sentence list / skeleton / empty state */}
      <SentenceList
        sentences={sentences}
        isLoading={isGenerating}
        topic={topic}
        error={error}
        onStatsUpdate={handleStatsUpdate}
        onWordSaved={handleWordSaved}
      />

      {/* Saved words quick link */}
      {savedWordsCount > 0 && sentences.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            You have{' '}
            <a
              href="/saved"
              className="text-indigo-500 hover:text-indigo-700 font-medium underline-offset-2 hover:underline"
            >
              {savedWordsCount} saved word{savedWordsCount !== 1 ? 's' : ''}
            </a>{' '}
            in your vocabulary.
          </p>
        </div>
      )}
    </>
  )
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      }
    >
      <PracticePageContent />
    </Suspense>
  )
}
