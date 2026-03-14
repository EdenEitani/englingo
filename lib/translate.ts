// DeepL API (free tier — endpoint is api-free.deepl.com)
// The `context` parameter tells DeepL the surrounding sentence so it picks
// the right meaning (e.g. "oil" in a cooking sentence → שמן, not נפט).
const DEEPL_URL = 'https://api-free.deepl.com/v2/translate'

function cleanWord(word: string): string {
  return word.replace(/[^\w\s]/g, '').trim().toLowerCase()
}

export async function translateToHebrew(word: string, context?: string): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) throw new Error('DEEPL_API_KEY is not configured')

  const cleaned = cleanWord(word)
  if (!cleaned) throw new Error('Invalid word provided for translation')

  const body: Record<string, unknown> = {
    text: [cleaned],
    source_lang: 'EN',
    target_lang: 'HE',
  }

  // Provide the full sentence as context so DeepL picks the right word sense
  if (context) body.context = context

  const response = await fetch(DEEPL_URL, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DeepL API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const translation = data?.translations?.[0]?.text
  if (!translation) throw new Error('No translation returned from DeepL')

  return translation
}
