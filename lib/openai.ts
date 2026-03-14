// Uses Ollama's OpenAI-compatible API running locally at port 11434
import OpenAI from 'openai'
import { GeneratedSentence } from './types'

const ollama = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
  apiKey: 'ollama', // required by SDK but ignored by Ollama
})

const MODEL = process.env.OLLAMA_MODEL || 'llama3'

// Concise prompt that outputs JSONL — one sentence per line, no wrapper object.
// Keeps the output small so the model finishes fast and we can stream early.
const SYSTEM_PROMPT = `You are an English teacher. Output exactly 5 sentences as JSONL.
One JSON object per line, nothing else — no intro, no explanation, no markdown.
Each line must be a complete valid JSON object in this exact format:
{"id":"s1","text":"Sentence here.","difficulty":"beginner","length_category":"short","keyword_focus":"word"}

Rules:
- id: "s1" through "s5"
- difficulty: "beginner" (×2), "easy-intermediate" (×2), "intermediate" (×1)
- length_category: "short" 5-8 words (×2), "medium" 9-14 words (×2), "long" 15-20 words (×1)
- Natural modern English, relevant to the topic, not too complex
- Output lines immediately as you go — do not wait`

// Async generator: yields each sentence as soon as Ollama outputs a complete JSON line.
// This lets the API route stream sentences to the browser one by one.
export async function* streamSentences(
  topic: string,
  savedWords?: string[]
): AsyncGenerator<GeneratedSentence> {
  const userPrompt =
    savedWords && savedWords.length > 0
      ? `Topic: ${topic}. Try to use some of these words: ${savedWords.slice(0, 5).join(', ')}`
      : `Topic: ${topic}`

  const stream = await ollama.chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    stream: true,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  })

  let buffer = ''

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? ''
    buffer += delta

    // Emit each complete line as a parsed sentence
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? '' // keep incomplete last line in buffer

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue
      // Strip accidental markdown fences
      const clean = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim()
      if (!clean.startsWith('{')) continue
      try {
        const sentence = JSON.parse(clean) as GeneratedSentence
        if (sentence.id && sentence.text) yield sentence
      } catch {
        // Malformed line — skip
      }
    }
  }

  // Flush any remaining buffered content
  const trimmed = buffer.trim()
  if (trimmed.startsWith('{')) {
    try {
      const sentence = JSON.parse(trimmed) as GeneratedSentence
      if (sentence.id && sentence.text) yield sentence
    } catch {
      // ignore
    }
  }
}
