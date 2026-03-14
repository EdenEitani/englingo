import { NextRequest } from 'next/server'
import { streamSentences } from '@/lib/openai'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { topic, savedWords } = body

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Topic is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (topic.trim().length > 100) {
    return new Response(JSON.stringify({ error: 'Topic must be 100 characters or less' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()

  // Stream sentences to the client as JSONL (one sentence per line).
  // The frontend reads this stream and appends cards as each line arrives.
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const sentence of streamSentences(topic.trim(), savedWords)) {
          controller.enqueue(encoder.encode(JSON.stringify(sentence) + '\n'))
        }
      } catch (error) {
        console.error('[/api/generate] Stream error:', error)
        // Send an error sentinel so the client knows something went wrong
        controller.enqueue(
          encoder.encode(JSON.stringify({ __error: 'Generation failed. Please try again.' }) + '\n')
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  })
}
