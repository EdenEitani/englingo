// DeepL API (free tier — endpoint is api-free.deepl.com)
const DEEPL_URL = 'https://api-free.deepl.com/v2/translate'

function cleanWord(word: string): string {
  return word
    .replace(/[^\w\s]/g, '')
    .trim()
    .toLowerCase()
}

export async function translateToHebrew(word: string): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) {
    throw new Error('DEEPL_API_KEY is not configured')
  }

  const cleaned = cleanWord(word)
  if (!cleaned) {
    throw new Error('Invalid word provided for translation')
  }

  const response = await fetch(DEEPL_URL, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [cleaned],
      source_lang: 'EN',
      target_lang: 'HE',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DeepL API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  const translation = data?.translations?.[0]?.text

  if (!translation) {
    throw new Error('No translation returned from DeepL')
  }

  return translation
}
