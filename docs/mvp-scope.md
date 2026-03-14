# Englingo — MVP Scope

## In Scope (MVP v1.0)

### Features

#### 1. Topic-Based Sentence Generation
- [x] Free-text topic input field
- [x] Generate button triggers OpenAI call
- [x] Returns 8 English sentences (structured JSON)
- [x] Sentences vary in difficulty: beginner, easy-intermediate, intermediate
- [x] Sentences vary in length: short (5-8w), medium (9-14w), long (15-20w)
- [x] Difficulty badge shown on each sentence card
- [x] Loading skeleton during generation

#### 2. Sentence Audio (TTS)
- [x] Play button on each sentence card
- [x] ElevenLabs TTS (voice: Rachel, voice_id: 21m00Tcm4TlvDq8ikWAM)
- [x] In-memory audio cache (blob URLs, session-scoped)
- [x] Audio playback state (idle / loading / playing / done)
- [x] "Sentence fully heard" event fires on audio completion
- [x] Visual indicator when sentence has been fully heard

#### 3. Word Click Interaction
- [x] Each word is individually clickable
- [x] On click: fetch Hebrew translation via Google Translate API
- [x] On click: play word pronunciation via ElevenLabs
- [x] Tooltip shows: English word, Hebrew translation (RTL), Save button
- [x] Translation results cached in localStorage
- [x] Tooltip closes on outside click or ESC key

#### 4. Saved Vocabulary
- [x] Save button in word tooltip
- [x] Saved words stored in localStorage
- [x] Saved words page (/saved)
- [x] Each saved word shows English + Hebrew
- [x] "Practice" button generates sentences focused on that word
- [x] Unsave/remove word capability
- [x] Words grouped by topic

#### 5. Daily Progress Tracking
- [x] sentences_learned_today counter (heard or clicked ≥1 word)
- [x] words_discovered_today counter (unique new words clicked)
- [x] sentences_heard_today counter (audio completed)
- [x] Stats stored in localStorage, reset at midnight
- [x] Stats displayed in header cards (bilingual Hebrew/English labels)

#### 6. Navigation
- [x] Header with app name "Englingo"
- [x] Nav links: Practice | Saved Words
- [x] Responsive (mobile + desktop)

### Technical Requirements
- [x] Next.js 14 App Router
- [x] TypeScript (strict)
- [x] Tailwind CSS
- [x] All API keys server-side only
- [x] Error handling with user-friendly messages
- [x] No authentication (localStorage only)

## Out of Scope (MVP)

These are explicitly NOT in v1.0:

| Feature | Reason Deferred |
|---|---|
| User authentication | Adds friction; localStorage sufficient for MVP |
| Cloud sync of saved words | Needs auth first |
| Spaced repetition / flashcards | Separate feature, adds complexity |
| Progress charts/history | Needs persistent backend storage |
| Multiple languages | Focus on Hebrew→English for launch |
| Sentence bookmarking | Nice-to-have, not core |
| Grammar explanations | Scope creep |
| Social/leaderboard features | Needs auth + social graph |
| Mobile app | Web-first launch |
| Offline mode | Complexity not warranted for MVP |
| Custom voice selection | Single voice (Rachel) is sufficient |

## Quality Bar for MVP

- App loads in < 2 seconds (initial)
- Sentence generation completes in < 5 seconds
- TTS audio starts playing in < 3 seconds
- Translation appears in < 2 seconds
- No runtime TypeScript errors
- No console errors in normal usage
- Works on Chrome, Firefox, Safari (latest)
- Responsive down to 375px width (iPhone SE)

## MVP Definition of Done

The MVP is complete when:
1. A user can type any topic and receive 8 practice sentences
2. A user can hear any sentence pronounced
3. A user can click any word and see its Hebrew translation + hear it
4. A user can save words and view them on /saved
5. Daily stats update correctly across interactions
6. The app works without any server-side database (localStorage only)
7. No API keys are exposed to the browser
8. The UI is polished and professional-looking
