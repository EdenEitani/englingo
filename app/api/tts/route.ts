import { NextRequest, NextResponse } from 'next/server'
import { generateSpeech } from '@/lib/elevenlabs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, type } = body

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (!type || !['sentence', 'word'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "sentence" or "word"' },
        { status: 400 }
      )
    }

    const audioBuffer = await generateSpeech(text.trim(), type)

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('[/api/tts] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate audio. Please try again.' },
      { status: 500 }
    )
  }
}
