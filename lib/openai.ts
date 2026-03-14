// Uses Ollama's OpenAI-compatible API running locally at port 11434
import OpenAI from 'openai'
import { GeneratedSentence } from './types'

const ollama = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
  apiKey: 'ollama',
})

const MODEL = process.env.OLLAMA_MODEL || 'llama3'

const BASE_SYSTEM_PROMPT = `You are an English teacher. Output exactly 5 sentences as JSONL.
One JSON object per line, nothing else — no intro, no explanation, no markdown.
Each line must be a complete valid JSON object in this exact format:
{"id":"s1","text":"Sentence here.","difficulty":"beginner","length_category":"short","keyword_focus":"word"}

Rules:
- id: "s1" through "s5"
- difficulty: "beginner" (×2), "easy-intermediate" (×2), "intermediate" (×1)
- length_category: "short" 5-8 words (×2), "medium" 9-14 words (×2), "long" 15-20 words (×1)
- Natural modern English, relevant to the topic, not too complex
- Output lines immediately as you go — do not wait`

// Used when the user clicks "Load More" — harder and longer than the initial batch
function buildLoadMorePrompt(existingCount: number): string {
  const nextId = existingCount + 1
  return `You are an English teacher. Output exactly 5 MORE sentences as JSONL.
One JSON object per line, nothing else — no intro, no explanation, no markdown.
Each line must be a complete valid JSON object in this exact format:
{"id":"s${nextId}","text":"Sentence here.","difficulty":"easy-intermediate","length_category":"medium","keyword_focus":"word"}

Rules:
- ids: "s${nextId}" through "s${nextId + 4}"
- difficulty: "easy-intermediate" (×2), "intermediate" (×3) — NO beginners, must be harder
- length_category: "medium" 9-14 words (×2), "long" 15-20 words (×3) — longer than before
- Explore different aspects of the topic not yet covered
- Use richer vocabulary, more natural phrasing, varied sentence structures
- Natural modern English
- Output lines immediately as you go — do not wait`
}

export interface StreamOptions {
  loadMore?: boolean
  existingCount?: number
  savedWords?: string[]
}

export async function* streamSentences(
  topic: string,
  options: StreamOptions = {}
): AsyncGenerator<GeneratedSentence> {
  const { loadMore = false, existingCount = 0, savedWords } = options

  const systemPrompt = loadMore ? buildLoadMorePrompt(existingCount) : BASE_SYSTEM_PROMPT

  const userPrompt = savedWords && savedWords.length > 0
    ? `Topic: ${topic}. Try to use some of these words: ${savedWords.slice(0, 5).join(', ')}`
    : `Topic: ${topic}`

  const stream = await ollama.chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  let buffer = ''

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? ''
    buffer += delta

    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue
      const clean = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim()
      if (!clean.startsWith('{')) continue
      try {
        const sentence = JSON.parse(clean) as GeneratedSentence
        if (sentence.id && sentence.text) yield sentence
      } catch {
        // skip malformed line
      }
    }
  }

  // Flush remaining buffer
  const trimmed = buffer.trim()
  if (trimmed.startsWith('{')) {
    try {
      const sentence = JSON.parse(trimmed) as GeneratedSentence
      if (sentence.id && sentence.text) yield sentence
    } catch { /* ignore */ }
  }
}
