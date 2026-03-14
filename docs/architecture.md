# Englingo — Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  React UI   │  │ localStorage │  │  AudioManager │  │
│  │ Components  │  │  (user data) │  │  (blob cache) │  │
│  └──────┬──────┘  └──────────────┘  └───────────────┘  │
│         │ fetch()                                        │
└─────────┼───────────────────────────────────────────────┘
          │
┌─────────┼───────────────────────────────────────────────┐
│         │         Next.js 14 Server (Vercel)            │
│  ┌──────▼──────────────────────────────────────┐        │
│  │              API Route Handlers              │        │
│  │  /api/generate  /api/tts  /api/translate    │        │
│  └──────┬──────────────┬──────────────┬────────┘        │
└─────────┼──────────────┼──────────────┼─────────────────┘
          │              │              │
     ┌────▼────┐   ┌─────▼─────┐  ┌────▼──────────┐
     │ OpenAI  │   │ElevenLabs │  │Google Translate│
     │GPT-4o-m │   │  TTS API  │  │    API v2      │
     └─────────┘   └───────────┘  └───────────────┘
```

## Directory Structure

```
/Users/edeneitani/englingo/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata, nav)
│   ├── page.tsx                # Main practice page
│   ├── globals.css             # Global styles + Tailwind directives
│   ├── saved/
│   │   └── page.tsx            # Saved vocabulary page
│   └── api/
│       ├── generate/
│       │   └── route.ts        # POST /api/generate
│       ├── tts/
│       │   └── route.ts        # POST /api/tts
│       └── translate/
│           └── route.ts        # POST /api/translate
├── components/
│   ├── TopicInput.tsx          # Topic input + generate button
│   ├── SentenceCard.tsx        # Sentence with clickable words
│   ├── WordChip.tsx            # Individual clickable word
│   ├── WordTooltip.tsx         # Hebrew translation popup
│   ├── SentenceList.tsx        # List + skeleton loader
│   ├── ProgressBar.tsx         # Daily stats cards
│   ├── SavedWordsList.tsx      # Saved words list
│   └── EmptyState.tsx          # Pre-generation empty state
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   ├── storage.ts              # localStorage helpers
│   ├── audio.ts                # AudioManager class
│   ├── openai.ts               # OpenAI sentence generation
│   ├── elevenlabs.ts           # ElevenLabs TTS helper
│   └── translate.ts            # Google Translate helper
├── docs/                       # Planning documents
├── .env.local                  # Local environment variables
├── .env.example                # Example env file for new devs
└── README.md
```

## Data Flow

### Sentence Generation Flow
```
User types topic → TopicInput → POST /api/generate
  → openai.ts calls OpenAI GPT-4o-mini
  → Returns GeneratedSentence[]
  → SentenceList renders SentenceCard for each
```

### TTS Audio Flow
```
User clicks play → SentenceCard → POST /api/tts { text, type }
  → elevenlabs.ts calls ElevenLabs API
  → Returns audio/mpeg stream
  → audio.ts caches blob URL → HTMLAudioElement plays
  → onEnd callback → updateDailyStats (sentences_heard++)
```

### Word Click Flow
```
User clicks word → WordChip → Check translationCache
  → Cache miss: POST /api/translate { word }
    → translate.ts calls Google Translate API
    → Cache result in localStorage
  → Play word audio (POST /api/tts { text: word, type: 'word' })
  → Show WordTooltip (Hebrew + Save button)
  → addDiscoveredWord(word) → updateDailyStats
```

### Save Word Flow
```
User clicks Save in WordTooltip
  → saveWord({ english, hebrew, topic, saved_at })
  → Persisted to localStorage
  → savedWords state updated in parent
  → WordChip shows bookmark icon
```

## Component Hierarchy

```
app/page.tsx (state owner)
├── ProgressBar (dailyStats)
├── TopicInput (onGenerate)
└── SentenceList
    └── SentenceCard (per sentence)
        └── WordChip (per word)
            └── WordTooltip (on click)

app/saved/page.tsx
└── SavedWordsList
    └── SavedWordItem (per word)
```

## State Management Strategy

- **Server state**: OpenAI responses (in-component useState, no caching across sessions)
- **Client session state**: Audio cache (AudioManager Map, in-memory), active tooltip
- **Persistent client state**: Saved words, daily stats, translation cache (localStorage)
- **No global state manager needed** for MVP — prop drilling is acceptable at this scale

## Security Architecture

- All API keys are **server-side only** (Next.js API routes / route handlers)
- Client code never sees `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, or `GOOGLE_TRANSLATE_API_KEY`
- `NEXT_PUBLIC_` prefix is NOT used for sensitive keys
- API routes validate input before forwarding to third-party services

## Auth Architecture (MVP Decision)

**MVP: No authentication.** Rationale:
- Reduces onboarding friction to zero
- localStorage provides sufficient persistence for single-device use
- Architecture cleanly separates concerns so auth can be added without refactor

**Future auth plan (v2):**
- Supabase Auth (email + Google OAuth)
- Replace localStorage calls with Supabase client queries
- `lib/storage.ts` is the single adapter — only this file changes
- Add middleware for protected routes

## Deployment Architecture

```
GitHub repo → Vercel (auto-deploy on push)
  Environment variables set in Vercel dashboard
  Edge network serves static assets
  Serverless functions serve API routes
```

## Performance Considerations

- Audio blobs cached in AudioManager Map (avoid re-fetching same TTS)
- Translation results cached in localStorage (persist across sessions)
- Sentences generated fresh each topic change (no server-side caching needed)
- No heavy dependencies — bundle stays lean
