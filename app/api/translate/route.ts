import { NextRequest, NextResponse } from 'next/server'
import { translateToHebrew } from '@/lib/translate'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { word, context } = body

    if (!word || typeof word !== 'string' || word.trim().length === 0) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 })
    }

    const translation = await translateToHebrew(word.trim(), context?.trim())

    return NextResponse.json({ translation })
  } catch (error) {
    console.error('[/api/translate] Error:', error)
    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    )
  }
}
