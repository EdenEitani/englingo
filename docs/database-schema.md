# Englingo — Database Schema

## Current State (MVP)

In the MVP, **no database is used**. All user data is stored in browser `localStorage`. This document defines the schema for the **future Supabase migration** (v2).

The localStorage data structures are designed to mirror these SQL schemas exactly, making migration straightforward.

---

## Future Supabase Schema (v2)

### users

Managed by Supabase Auth. No custom table needed for basic auth — we use `auth.users`.

```sql
-- Supabase Auth provides this automatically
-- auth.users (id, email, created_at, ...)
```

### saved_words

```sql
CREATE TABLE saved_words (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  english     TEXT NOT NULL,
  hebrew      TEXT NOT NULL,
  topic       TEXT NOT NULL DEFAULT '',
  saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT saved_words_user_english_unique UNIQUE (user_id, english)
);

-- Row Level Security
ALTER TABLE saved_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own saved words"
  ON saved_words FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved words"
  ON saved_words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved words"
  ON saved_words FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast user lookups
CREATE INDEX idx_saved_words_user_id ON saved_words(user_id);
CREATE INDEX idx_saved_words_topic ON saved_words(user_id, topic);
```

### daily_stats

```sql
CREATE TABLE daily_stats (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date                  DATE NOT NULL,
  sentences_learned     INTEGER NOT NULL DEFAULT 0,
  sentences_heard       INTEGER NOT NULL DEFAULT 0,
  words_discovered      INTEGER NOT NULL DEFAULT 0,
  discovered_words_set  TEXT[] NOT NULL DEFAULT '{}',
  heard_sentences_set   TEXT[] NOT NULL DEFAULT '{}',
  learned_sentences_set TEXT[] NOT NULL DEFAULT '{}',

  CONSTRAINT daily_stats_user_date_unique UNIQUE (user_id, date)
);

-- Row Level Security
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own stats"
  ON daily_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own stats"
  ON daily_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON daily_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date DESC);
```

### word_translation_cache

```sql
-- Global translation cache (not user-specific — same word always translates the same)
CREATE TABLE word_translation_cache (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  english     TEXT NOT NULL UNIQUE,
  hebrew      TEXT NOT NULL,
  cached_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No RLS needed — this is a public read table
CREATE INDEX idx_translation_cache_english ON word_translation_cache(english);
```

---

## Migration Plan (MVP → v2)

### Step 1: Add Supabase Auth
```
npm install @supabase/supabase-js @supabase/ssr
```
Add auth middleware, login/signup pages.

### Step 2: Create Supabase Tables
Run the SQL above in Supabase SQL editor or via migration files.

### Step 3: Update lib/storage.ts
Replace localStorage calls with Supabase client queries. The function signatures remain the same — only the implementation changes:

```typescript
// Before (MVP)
export function getSavedWords(): SavedWord[] {
  const data = localStorage.getItem(SAVED_WORDS_KEY)
  return data ? JSON.parse(data) : []
}

// After (v2)
export async function getSavedWords(): Promise<SavedWord[]> {
  const { data } = await supabase
    .from('saved_words')
    .select('*')
    .order('saved_at', { ascending: false })
  return data ?? []
}
```

### Step 4: Handle Migration of Existing Data
For users upgrading from MVP to v2, offer to import their localStorage data to Supabase on first login.

---

## localStorage Structure (MVP Reference)

| Key | Type | Purpose |
|-----|------|---------|
| `englingo_saved_words` | `SavedWord[]` | User's vocabulary list |
| `englingo_daily_stats` | `DailyStats` | Today's learning progress |
| `englingo_word_translations_cache` | `Record<string, string>` | Cached translations |

## Data Retention Policy (Future)

- Daily stats: retain 90 days, then archive
- Saved words: retain indefinitely (user-controlled)
- Translation cache: retain indefinitely (global shared resource)
