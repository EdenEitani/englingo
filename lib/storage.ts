import { SavedWord, DailyStats } from './types'

const SAVED_WORDS_KEY = 'englingo_saved_words'
const DAILY_STATS_KEY = 'englingo_daily_stats'
const TRANSLATION_CACHE_KEY = 'englingo_word_translations_cache'

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Saved Words ───────────────────────────────────────────────────────────

export function getSavedWords(): SavedWord[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(SAVED_WORDS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveWord(word: Omit<SavedWord, 'id' | 'saved_at'>): SavedWord {
  const words = getSavedWords()
  // Avoid duplicates
  const existing = words.find((w) => w.english.toLowerCase() === word.english.toLowerCase())
  if (existing) return existing

  const newWord: SavedWord = {
    ...word,
    id: generateId(),
    saved_at: new Date().toISOString(),
  }
  const updated = [newWord, ...words]
  localStorage.setItem(SAVED_WORDS_KEY, JSON.stringify(updated))
  return newWord
}

export function removeWord(id: string): void {
  const words = getSavedWords()
  const updated = words.filter((w) => w.id !== id)
  localStorage.setItem(SAVED_WORDS_KEY, JSON.stringify(updated))
}

export function isWordSaved(english: string): boolean {
  const words = getSavedWords()
  return words.some((w) => w.english.toLowerCase() === english.toLowerCase())
}

// ─── Daily Stats ────────────────────────────────────────────────────────────

function getEmptyStats(): DailyStats {
  return {
    date: getTodayDate(),
    sentences_learned: 0,
    sentences_heard: 0,
    words_discovered: 0,
    discovered_words_set: [],
    heard_sentences_set: [],
    learned_sentences_set: [],
  }
}

export function getDailyStats(): DailyStats {
  if (typeof window === 'undefined') return getEmptyStats()
  try {
    const data = localStorage.getItem(DAILY_STATS_KEY)
    if (!data) return getEmptyStats()

    const stats: DailyStats = JSON.parse(data)
    // Reset if it's a new day
    if (stats.date !== getTodayDate()) {
      const fresh = getEmptyStats()
      localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(fresh))
      return fresh
    }
    return stats
  } catch {
    return getEmptyStats()
  }
}

function saveStats(stats: DailyStats): void {
  localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats))
}

export function incrementSentenceLearned(sentenceId: string): DailyStats {
  const stats = getDailyStats()
  if (stats.learned_sentences_set.includes(sentenceId)) return stats

  const updated: DailyStats = {
    ...stats,
    sentences_learned: stats.sentences_learned + 1,
    learned_sentences_set: [...stats.learned_sentences_set, sentenceId],
  }
  saveStats(updated)
  return updated
}

export function incrementSentenceHeard(sentenceId: string): DailyStats {
  const stats = getDailyStats()
  if (stats.heard_sentences_set.includes(sentenceId)) return stats

  const updated: DailyStats = {
    ...stats,
    sentences_heard: stats.sentences_heard + 1,
    heard_sentences_set: [...stats.heard_sentences_set, sentenceId],
  }
  saveStats(updated)
  return updated
}

export function addDiscoveredWord(word: string): DailyStats {
  const stats = getDailyStats()
  const normalized = word.toLowerCase()
  if (stats.discovered_words_set.includes(normalized)) return stats

  const updated: DailyStats = {
    ...stats,
    words_discovered: stats.words_discovered + 1,
    discovered_words_set: [...stats.discovered_words_set, normalized],
  }
  saveStats(updated)
  return updated
}

export function updateDailyStats(partial: Partial<DailyStats>): DailyStats {
  const stats = getDailyStats()
  const updated = { ...stats, ...partial }
  saveStats(updated)
  return updated
}

// ─── Translation Cache ────────────────────────────────────────────────────

export function getTranslationCache(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const data = localStorage.getItem(TRANSLATION_CACHE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function getTranslationFromCache(word: string): string | null {
  const cache = getTranslationCache()
  return cache[word.toLowerCase()] ?? null
}

export function setTranslationCache(word: string, translation: string): void {
  const cache = getTranslationCache()
  cache[word.toLowerCase()] = translation
  localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache))
}
