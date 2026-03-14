import { notFound } from 'next/navigation'
import { getStory, getAllStories } from '@/lib/stories'
import StoryReaderClient from './StoryReaderClient'

// Pre-generate all story pages at build time
export function generateStaticParams() {
  return getAllStories().map((s) => ({ id: s.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const story = getStory(id)
  if (!story) return {}
  return {
    title: `${story.title} — Englingo`,
    description: story.description,
  }
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const story = getStory(id)
  if (!story) notFound()

  return <StoryReaderClient story={story} />
}
