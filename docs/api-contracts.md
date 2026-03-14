# Englingo — API Contracts

## Overview

All API routes are Next.js App Router Route Handlers located in `app/api/`. They are server-side only — no API keys are exposed to the browser.

---

## POST /api/generate

Generates English practice sentences for a given topic using OpenAI GPT-4o-mini.

### Request

```
POST /api/generate
Content-Type: application/json
```

```json
{
  "topic": "string (required, 1-100 chars)",
  "savedWords": ["string"] // optional array of saved words to focus on
}
```

### Response (200 OK)

```json
{
  "sentences": [
    {
      "id": "s1",
      "text": "I love trying new foods when I travel.",
      "difficulty": "beginner",
      "length_category": "short",
      "keyword_focus": "travel"
    },
    {
      "id": "s2",
      "text": "The restaurant had an amazing selection of local dishes that I had never tried before.",
      "difficulty": "easy-intermediate",
      "length_category": "long",
      "keyword_focus": "restaurant"
    }
    // ... 8 total
  ]
}
```

### Response (400 Bad Request)

```json
{
  "error": "Topic is required"
}
```

### Response (500 Internal Server Error)

```json
{
  "error": "Failed to generate sentences"
}
```

### Implementation Notes
- Model: `gpt-4o-mini`
- Temperature: `0.8`
- System prompt ensures structured JSON output
- Always returns exactly 8 sentences
- Mix: 2-3 beginner, 3 easy-intermediate, 2 intermediate
- Mix lengths: 2-3 short, 3 medium, 2 long

---

## POST /api/tts

Converts text to speech using ElevenLabs API. Returns audio stream.

### Request

```
POST /api/tts
Content-Type: application/json
```

```json
{
  "text": "string (required)",
  "type": "sentence" | "word" (required)
}
```

### Response (200 OK)

```
Content-Type: audio/mpeg

[binary audio data]
```

### Response (400 Bad Request)

```json
{
  "error": "Text is required"
}
```

### Response (500 Internal Server Error)

```json
{
  "error": "Failed to generate audio"
}
```

### Implementation Notes
- Voice ID: `21m00Tcm4TlvDq8ikWAM` (Rachel)
- Model: `eleven_multilingual_v2`
- Sentence voice settings: `{ stability: 0.5, similarity_boost: 0.75 }`
- Word voice settings: `{ stability: 0.7, similarity_boost: 0.75 }` (slightly slower/clearer)
- ElevenLabs endpoint: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- Returns audio stream directly to client

---

## POST /api/translate

Translates an English word to Hebrew using Google Translate API v2.

### Request

```
POST /api/translate
Content-Type: application/json
```

```json
{
  "word": "string (required)"
}
```

### Response (200 OK)

```json
{
  "translation": "מסעדה"
}
```

### Response (400 Bad Request)

```json
{
  "error": "Word is required"
}
```

### Response (500 Internal Server Error)

```json
{
  "error": "Translation failed"
}
```

### Implementation Notes
- Google Translate REST API v2: `https://translation.googleapis.com/language/translate/v2`
- Source language: `en`
- Target language: `iw` (Hebrew)
- Input cleaning: strip punctuation, trim, lowercase before API call
- API key passed as query param: `?key=${GOOGLE_TRANSLATE_API_KEY}`

---

## Client-Side Data (localStorage)

These are not API routes — they are browser localStorage operations.

### englingo_saved_words

Type: `SavedWord[]`

```json
[
  {
    "id": "uuid-string",
    "english": "restaurant",
    "hebrew": "מסעדה",
    "topic": "food",
    "saved_at": "2024-01-15T10:30:00.000Z"
  }
]
```

### englingo_daily_stats

Type: `DailyStats`

```json
{
  "date": "2024-01-15",
  "sentences_learned": 3,
  "sentences_heard": 2,
  "words_discovered": 7,
  "discovered_words_set": ["restaurant", "amazing", "selection"],
  "heard_sentences_set": ["s1", "s3"],
  "learned_sentences_set": ["s1", "s2", "s3"]
}
```

### englingo_word_translations_cache

Type: `Record<string, string>`

```json
{
  "restaurant": "מסעדה",
  "amazing": "מדהים",
  "travel": "נסיעה"
}
```
