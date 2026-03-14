// Generic story model — designed to support multiple source types.
// Today: 'builtin' (hardcoded text).
// Future: 'url' (fetch + parse plain text), 'pdf' (use pdf-parse / pdfjs-dist).

export type StorySourceType = 'builtin' | 'url' | 'pdf'
export type StoryDifficulty = 'beginner' | 'easy-intermediate' | 'intermediate'

export interface Story {
  id: string
  title: string
  author: string                  // Author of the original source material
  sourceType: StorySourceType
  sourceUrl?: string              // Used when sourceType is 'url' or 'pdf'
  difficulty: StoryDifficulty
  coverEmoji: string
  description: string
  descriptionHe: string           // Hebrew description for the UI
  wordCount: number               // Approximate, for display
  paragraphs: string[]            // Populated for 'builtin'; loaded async for 'url'/'pdf'
}

// ---------------------------------------------------------------------------
// Registry — add new stories here. For 'url'/'pdf' types, leave paragraphs []
// and call loadStoryContent(story) to populate them at runtime.
// ---------------------------------------------------------------------------
import { BUILTIN_STORIES } from './storyContent'

export const STORIES: Story[] = BUILTIN_STORIES

export function getAllStories(): Story[] {
  return STORIES
}

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id)
}

// ---------------------------------------------------------------------------
// Future content loaders — wire these up when adding url/pdf support.
// ---------------------------------------------------------------------------

// async function loadStoryFromUrl(url: string): Promise<string[]> {
//   const text = await fetch(url).then((r) => r.text())
//   return text.split(/\n{2,}/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean)
// }

// async function loadStoryFromPdf(buffer: ArrayBuffer): Promise<string[]> {
//   // const pdfParse = await import('pdf-parse')
//   // const data = await pdfParse(Buffer.from(buffer))
//   // return data.text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
// }

// export async function loadStoryContent(story: Story): Promise<string[]> {
//   if (story.sourceType === 'url' && story.sourceUrl) return loadStoryFromUrl(story.sourceUrl)
//   if (story.sourceType === 'pdf' && story.sourceUrl) {
//     const buf = await fetch(story.sourceUrl).then(r => r.arrayBuffer())
//     return loadStoryFromPdf(buf)
//   }
//   return story.paragraphs
// }
