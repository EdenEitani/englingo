const ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL' // Sarah (free premade)
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'

interface VoiceSettings {
  stability: number
  similarity_boost: number
}

export async function generateSpeech(
  text: string,
  type: 'sentence' | 'word' = 'sentence'
): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not configured')
  }

  const voiceSettings: VoiceSettings =
    type === 'word'
      ? { stability: 0.7, similarity_boost: 0.75 } // Slightly slower/clearer for words
      : { stability: 0.5, similarity_boost: 0.75 }  // Natural for sentences

  const url = `${ELEVENLABS_BASE_URL}/text-to-speech/${ELEVENLABS_VOICE_ID}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5', // faster, free-plan compatible
      voice_settings: voiceSettings,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ElevenLabs API error ${response.status}: ${errorText}`)
  }

  return response.arrayBuffer()
}
