# Englingo — Planned Features

Focused on adult Hebrew speakers learning English through **listening and speaking** (not writing).

---

## Priority 1 — Listening & Comprehension

### ✅ 1. Listen & Fill the Gap *(Cloze listening)*
**Status:** Implemented (v1.1)
A sentence plays automatically. One content word is replaced with a blank. The user picks the missing word from 3 options (correct + 2 distractors from other sentences). Pure listening comprehension — no writing.

### ✅ 2. Speed Control on Audio
**Status:** Implemented (v1.1)
A global 0.75x / 1x / 1.25x toggle. Applied via `HTMLAudioElement.playbackRate`. Preference saved to localStorage. Lets learners hear sentences slowly first, then at natural speed.

### 3. Repeat Mode
**Status:** Planned
A loop button on each sentence card. Plays the sentence 2–3 times automatically with a 1.5s pause between repetitions. Useful for passive listening and absorption.

---

## Priority 2 — Speaking

### ✅ 4. Shadowing Mode
**Status:** Implemented (v1.1)
A mic button on each sentence card. Flow: plays sentence audio → 3-second countdown → "Say it now! 🎤" prompt for 5 seconds. Timer-based, no speech recognition required. Tracks "shadowed sentences" in daily stats.

### 5. Pronunciation Check *(Web Speech API)*
**Status:** Planned
After listening to a sentence, user taps a microphone button and says it out loud. Browser transcribes via Web Speech API (free, no backend). App compares to original text and highlights words that matched (green) vs missed (orange). No external API needed.

### 6. Shadowing Tracker
**Status:** Planned — partial (shadowing count in stats already tracked)
Full history view of all sentences a user has shadowed, with a "practice again" button. Separate stats: sentences shadowed this week.

---

## Priority 3 — Vocabulary

### 7. Flashcard Review for Saved Words
**Status:** Planned
A "Review" session on the `/saved` page. Shows Hebrew → user guesses English. Card flips to reveal + plays pronunciation. No writing — tap to reveal and self-assess. Optionally: spaced repetition ordering.

### 8. Word Frequency / CEFR Level Badge
**Status:** Planned
Show A1/A2/B1/B2 level badge on clicked words using a static CEFR word list. Helps learners prioritize high-frequency vocabulary.

### 9. Example Sentences for Saved Words
**Status:** Planned
On hover/tap in `/saved`, show the original sentence the word came from as context. Data is already available — just needs to be stored at save time.

---

## Priority 4 — Content

### 10. Conversation Mode
**Status:** Planned
Generate a short 4–6 line dialogue between two people on the chosen topic (instead of isolated sentences). Each line is playable. More natural for adult learners preparing for real conversation.
Prompt approach: ask Ollama for JSONL of `{ speaker: "A"|"B", line: "..." }`.

### 11. News Headlines Mode
**Status:** Planned
Pull real English headlines from a free RSS feed (BBC World Service, Reuters). Display as readable + clickable sentences. Real-world English adults actually encounter daily.

### 12. Idiom / Phrase of the Day
**Status:** Planned
One English idiom per day with Hebrew explanation and an example sentence. Playable. Saveable. Idioms are stored in a static JSON list; daily selection is deterministic by date.

---

## Priority 5 — UX Improvements

### 13. Autoplay Next Sentence
**Status:** Planned
After a sentence finishes playing, automatically play the next one. Optional toggle. Great for passive listening while doing something else.

### 14. Search in Saved Words
**Status:** Planned
Simple client-side text filter on `/saved`. Useful once the list grows to 30+ words.

### 15. Font Size Control
**Status:** Planned
Small/Medium/Large toggle. Saved to localStorage. Larger text improves comfort for adult learners reading alongside listening.

---

## Infrastructure / Future

| Feature | Notes |
|---|---|
| Supabase auth | Email + Google OAuth; enables cross-device sync |
| Cloud sync | Sync saved words + stats across devices |
| PDF story upload | Wire up `pdf-parse` in `lib/stories.ts` (stubs already exist) |
| Progress charts | Weekly/monthly listening streaks |
| Mobile app | React Native or PWA |
| Multiple languages | Architecture is language-agnostic already |
