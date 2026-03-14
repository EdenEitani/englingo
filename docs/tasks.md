# Englingo — Implementation Tasks

## Phase 1: Setup & Scaffolding
- [x] Create planning docs
- [x] Scaffold Next.js 14 app (App Router + TypeScript + Tailwind)
- [x] Install dependencies (supabase, openai, elevenlabs, lucide-react, clsx, tailwind-merge)
- [x] Update .env.local with correct variable names
- [x] Create .env.example

## Phase 2: Core Library
- [x] lib/types.ts — TypeScript interfaces
- [x] lib/storage.ts — localStorage helpers
- [x] lib/audio.ts — AudioManager class
- [x] lib/openai.ts — OpenAI sentence generation helper
- [x] lib/elevenlabs.ts — ElevenLabs TTS helper
- [x] lib/translate.ts — Google Translate helper

## Phase 3: API Routes
- [x] app/api/generate/route.ts — POST sentence generation
- [x] app/api/tts/route.ts — POST text-to-speech
- [x] app/api/translate/route.ts — POST word translation

## Phase 4: UI Components
- [x] components/EmptyState.tsx
- [x] components/ProgressBar.tsx
- [x] components/TopicInput.tsx
- [x] components/WordTooltip.tsx
- [x] components/WordChip.tsx
- [x] components/SentenceCard.tsx
- [x] components/SentenceList.tsx
- [x] components/SavedWordsList.tsx

## Phase 5: Pages
- [x] app/layout.tsx — Root layout with nav
- [x] app/globals.css — Global styles
- [x] app/page.tsx — Main practice page
- [x] app/saved/page.tsx — Saved vocabulary page

## Phase 6: Documentation
- [x] README.md
- [x] docs/project-overview.md
- [x] docs/architecture.md
- [x] docs/mvp-scope.md
- [x] docs/tasks.md (this file)
- [x] docs/api-contracts.md
- [x] docs/database-schema.md

## Task Details

### lib/types.ts
- GeneratedSentence interface
- SavedWord interface
- DailyStats interface
- WordInteraction interface

### lib/storage.ts
- getSavedWords / saveWord / removeWord
- getDailyStats / updateDailyStats
- incrementSentenceLearned / incrementSentenceHeard
- addDiscoveredWord
- getTranslationCache / setTranslationCache
- Date reset logic for daily stats

### lib/audio.ts
- AudioManager class with Map cache
- playText(text, onEnd?) method
- stop() method
- isPlaying getter

### API Routes
- /api/generate: validate topic, call OpenAI, parse JSON, return sentences
- /api/tts: validate text, call ElevenLabs, stream audio back
- /api/translate: clean word, call Google Translate, return Hebrew

### Components
Each component:
- Fully typed props
- 'use client' where needed
- Proper error states
- Accessible (aria labels)
- Responsive

### Pages
- Main page: full state management (topic, sentences, stats, savedWords)
- Saved page: read localStorage, practice button, empty state
