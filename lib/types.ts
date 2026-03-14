export interface GeneratedSentence {
  id: string
  text: string
  difficulty: 'beginner' | 'easy-intermediate' | 'intermediate'
  length_category: 'short' | 'medium' | 'long'
  keyword_focus?: string
}

export interface SavedWord {
  id: string
  english: string
  hebrew: string
  topic: string
  saved_at: string
}

export interface DailyStats {
  date: string
  sentences_learned: number
  sentences_heard: number
  words_discovered: number
  sentences_shadowed: number
  discovered_words_set: string[]   // unique words clicked today
  heard_sentences_set: string[]    // sentence ids fully heard
  learned_sentences_set: string[]  // sentence ids counted as learned
  shadowed_sentences_set: string[] // sentence ids shadowed today
}

export interface WordInteraction {
  word: string
  hebrew: string
  topic: string
}
