import { SavedWord, DailyStats, GeneratedSentence } from './types'

const SAVED_WORDS_KEY = 'englingo_saved_words'
const DAILY_STATS_KEY = 'englingo_daily_stats'
const TRANSLATION_CACHE_KEY = 'englingo_word_translations_cache'
const LAST_SESSION_KEY = 'englingo_last_session'
const AUDIO_SPEED_KEY = 'englingo_audio_speed'
const FONT_SIZE_KEY = 'englingo_font_size'

// ─── Last Practice Session ─────────────────────────────────────────────────

export interface LastSession {
  topic: string
  sentences: GeneratedSentence[]
  savedAt: string
}

export function getLastSession(): LastSession | null {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem(LAST_SESSION_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function saveLastSession(topic: string, sentences: GeneratedSentence[]): void {
  const session: LastSession = { topic, sentences, savedAt: new Date().toISOString() }
  localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(session))
}

export function clearLastSession(): void {
  localStorage.removeItem(LAST_SESSION_KEY)
}

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
    sentences_shadowed: 0,
    discovered_words_set: [],
    heard_sentences_set: [],
    learned_sentences_set: [],
    shadowed_sentences_set: [],
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

export function incrementSentenceShadowed(sentenceId: string): DailyStats {
  const stats = getDailyStats()
  if (stats.shadowed_sentences_set.includes(sentenceId)) return stats

  const updated: DailyStats = {
    ...stats,
    sentences_shadowed: stats.sentences_shadowed + 1,
    shadowed_sentences_set: [...stats.shadowed_sentences_set, sentenceId],
  }
  saveStats(updated)
  return updated
}

// ─── Audio Speed Preference ───────────────────────────────────────────────

export function getAudioSpeed(): number {
  if (typeof window === 'undefined') return 1.0
  const v = localStorage.getItem(AUDIO_SPEED_KEY)
  return v ? parseFloat(v) : 1.0
}

export function setAudioSpeed(rate: number): void {
  localStorage.setItem(AUDIO_SPEED_KEY, String(rate))
}

// ─── Font Size Preference ─────────────────────────────────────────────────

export type FontSize = 'sm' | 'md' | 'lg'

export function getFontSize(): FontSize {
  if (typeof window === 'undefined') return 'md'
  return (localStorage.getItem(FONT_SIZE_KEY) as FontSize) ?? 'md'
}

export function setFontSize(size: FontSize): void {
  localStorage.setItem(FONT_SIZE_KEY, size)
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
