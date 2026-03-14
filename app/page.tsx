'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TopicInput from '@/components/TopicInput'
import SentenceList from '@/components/SentenceList'
import ProgressBar from '@/components/ProgressBar'
import { GeneratedSentence, DailyStats } from '@/lib/types'
import { getDailyStats, getSavedWords, getLastSession, saveLastSession } from '@/lib/storage'

function PracticePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [topic, setTopic] = useState('')
  const [sentences, setSentences] = useState<GeneratedSentence[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats>(() => getDailyStats())
  const [savedWordsCount, setSavedWordsCount] = useState(0)

  // Restore last session + load stats on mount
  useEffect(() => {
    setDailyStats(getDailyStats())
    setSavedWordsCount(getSavedWords().length)
    const last = getLastSession()
    if (last) {
      setTopic(last.topic)
      setSentences(last.sentences)
    }
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
      const collected: GeneratedSentence[] = []

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
            collected.push(parsed)
            setSentences((prev) => [...prev, parsed])
          } catch (e) {
            if (e instanceof Error && e.message !== 'Unexpected end of JSON input') throw e
          }
        }
      }

      // Persist session so it survives page navigation
      if (collected.length > 0) saveLastSession(topicToGenerate, collected)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const handleLoadMore = useCallback(async () => {
    if (!topic || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const savedWords = getSavedWords().map((w) => w.english)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          savedWords: savedWords.slice(0, 10),
          loadMore: true,
          existingCount: sentences.length,
        }),
      })

      if (!response.ok || !response.body) throw new Error('Failed to load more sentences')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      const newSentences: GeneratedSentence[] = []

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
            newSentences.push(parsed)
            setSentences((prev) => [...prev, parsed])
          } catch (e) {
            if (e instanceof Error && e.message !== 'Unexpected end of JSON input') throw e
          }
        }
      }

      if (newSentences.length > 0) {
        setSentences((prev) => {
          const updated = [...prev]
          saveLastSession(topic, updated)
          return updated
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoadingMore(false)
    }
  }, [topic, isLoadingMore, sentences.length])

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
        isLoadingMore={isLoadingMore}
        topic={topic}
        error={error}
        onStatsUpdate={handleStatsUpdate}
        onWordSaved={handleWordSaved}
        onLoadMore={handleLoadMore}
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
