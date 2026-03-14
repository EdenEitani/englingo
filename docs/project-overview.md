# Englingo — Project Overview

## What is Englingo?

Englingo is a Hebrew-to-English language learning web app designed for Hebrew-speaking adults who want to improve their English skills through immersive, interactive practice. Rather than dry vocabulary drills, Englingo generates contextual English sentences on topics the learner cares about, lets them hear native-sounding pronunciation, click on unfamiliar words for instant Hebrew translation, and tracks their daily progress.

## Target Users

- Hebrew-speaking adults (ages 18–60)
- Intermediate Hebrew literacy assumed (UI labels include Hebrew)
- English proficiency: beginner to intermediate
- Motivation: practical English for travel, work, media consumption

## Core Value Proposition

1. **Topic-driven immersion** — Learn English in context YOU choose (travel, food, sports, etc.)
2. **Instant audio** — Hear every sentence and word pronounced naturally via ElevenLabs TTS
3. **Click-to-translate** — Tap any unfamiliar word for its Hebrew meaning, no dictionary needed
4. **Vocabulary saves** — Build a personal word bank and generate more sentences around those words
5. **Daily progress** — Visual motivation via daily stats (sentences learned, words discovered, full listens)

## Problem Solved

Existing English learning apps (Duolingo, Babbel) are gamified but rigid — learners can't practice vocabulary relevant to their immediate needs. Englingo bridges this gap: type a topic, get real sentences, hear them, understand them, and save what matters to you.

## MVP Scope

The MVP is a **no-auth, client-first** experience. All user data (saved words, daily stats, translation cache) is stored in `localStorage`. This allows:
- Zero friction onboarding (no signup)
- Instant value delivery
- Architecture that supports adding Supabase auth + cloud sync in v2

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth | None (MVP) | Reduce friction, faster time-to-value |
| Data storage | localStorage | Simple, no backend needed for MVP |
| TTS provider | ElevenLabs | Best natural English voices |
| Translation | Google Translate API | Reliable, accurate Hebrew output |
| Sentence AI | OpenAI GPT-4o-mini | Fast, cheap, high quality for structured output |
| Framework | Next.js 14 App Router | SSR + API routes in one project |
| Styling | Tailwind CSS | Rapid UI development |

## Success Metrics (MVP)

- User generates at least 1 session per visit
- User clicks at least 3 words per session
- User saves at least 1 word per session
- Daily stats are visible and motivating

## Future Roadmap (Post-MVP)

- Supabase auth (email/Google)
- Cloud-synced vocabulary and stats
- Spaced repetition flashcard mode
- Sentence difficulty preference settings
- Progress charts (weekly/monthly)
- Mobile app (React Native)
- Social features (leaderboards with friends)
- Subscription monetization
