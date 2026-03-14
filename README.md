# Englingo — Hebrew-to-English Learning App

A modern, AI-powered English learning app designed for Hebrew-speaking adults. Generate contextual English practice sentences on any topic, hear them with native pronunciation, click words for instant Hebrew translations, and build your personal vocabulary.

## Features

- **Topic-based sentence generation** — Type any topic to get 8 tailored English practice sentences
- **Native audio pronunciation** — ElevenLabs TTS (Rachel voice) for every sentence and word
- **Click-to-translate** — Click any word for instant Hebrew translation via Google Translate
- **Save vocabulary** — Build a personal word bank with English + Hebrew
- **Daily progress tracking** — Track sentences learned, words discovered, and full listens
- **No signup required** — Works instantly, stores data in your browser

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI Sentences | OpenAI GPT-4o-mini |
| Text-to-Speech | ElevenLabs API (Rachel voice) |
| Translation | Google Cloud Translate API v2 |
| Database (future) | Supabase (PostgreSQL) |
| Deployment | Vercel |

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `ELEVENLABS_API_KEY` | ElevenLabs API key for TTS | Yes |
| `OPENAI_API_KEY` | OpenAI API key for sentence generation | Yes |
| `GOOGLE_TRANSLATE_API_KEY` | Google Cloud Translate API key | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | No (future) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | No (future) |

## Local Development Setup

### Prerequisites
- Node.js 18+
- npm

### 1. Clone and install
```bash
git clone <repo-url>
cd englingo
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys (see section below for how to get them).

### 3. Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Getting API Keys

### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to API Keys → Create new secret key
4. Add billing information (GPT-4o-mini is very cheap)
5. Copy key to `OPENAI_API_KEY`

### ElevenLabs API Key
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Create an account (free tier available)
3. Go to Profile Settings → API Key
4. Copy key to `ELEVENLABS_API_KEY`
5. Note: Free tier has monthly character limits

### Google Translate API Key
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable the "Cloud Translation API"
4. Go to APIs & Services → Credentials → Create API Key
5. Restrict key to "Cloud Translation API" for security
6. Copy key to `GOOGLE_TRANSLATE_API_KEY`

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/englingo.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and connect your GitHub
2. Import the `englingo` repository
3. Go to Settings → Environment Variables
4. Add all required environment variables
5. Deploy

### 3. Set up Supabase (optional, for v2)
1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL from `docs/database-schema.md` in the SQL Editor
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel env vars

## Project Structure

```
englingo/
├── app/
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Main practice page
│   ├── globals.css         # Global styles
│   ├── saved/
│   │   ├── page.tsx        # Saved vocabulary page
│   │   └── SavedWordsPageClient.tsx
│   └── api/
│       ├── generate/route.ts   # Sentence generation
│       ├── tts/route.ts        # Text-to-speech
│       └── translate/route.ts  # Word translation
├── components/
│   ├── TopicInput.tsx      # Topic input + generate button
│   ├── SentenceCard.tsx    # Sentence with play button
│   ├── WordChip.tsx        # Clickable word in sentence
│   ├── WordTooltip.tsx     # Hebrew translation popup
│   ├── SentenceList.tsx    # Sentence list + skeleton
│   ├── ProgressBar.tsx     # Daily stats display
│   ├── SavedWordsList.tsx  # Saved vocabulary list
│   └── EmptyState.tsx      # Pre-generation state
├── lib/
│   ├── types.ts            # TypeScript interfaces
│   ├── storage.ts          # localStorage helpers
│   ├── audio.ts            # Audio playback manager
│   ├── openai.ts           # OpenAI integration
│   ├── elevenlabs.ts       # ElevenLabs integration
│   ├── translate.ts        # Google Translate integration
│   └── utils.ts            # Utility functions (cn)
└── docs/                   # Architecture & planning docs
```

## Architecture Notes

- **No Auth (MVP)**: All user data lives in `localStorage`. No signup required.
- **API Security**: All API keys are server-side only (Next.js route handlers). Never exposed to client.
- **Audio Caching**: ElevenLabs audio is cached as blob URLs in memory during a session.
- **Translation Caching**: Google Translate results are cached in `localStorage` to minimize API calls.

## Future Improvements

- [ ] Supabase auth (email + Google OAuth)
- [ ] Cloud sync for saved words and stats across devices
- [ ] Spaced repetition flashcard mode
- [ ] Weekly/monthly progress charts
- [ ] Difficulty preference settings
- [ ] Sentence bookmarking
- [ ] Grammar explanations per sentence
- [ ] Mobile app (React Native)
- [ ] Multiple target languages
- [ ] Pronunciation scoring via speech recognition

## License

MIT
