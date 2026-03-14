import { BookOpen } from 'lucide-react'
import { getAllStories } from '@/lib/stories'
import StoryCard from '@/components/StoryCard'

export const metadata = {
  title: 'Stories — Englingo',
  description: 'Read classic stories in English. Click any word for instant Hebrew translation.',
}

export default function StoriesPage() {
  const stories = getAllStories()

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-900">Stories</h1>
        </div>
        <p className="text-sm text-gray-500">
          Read classic stories in English. Click any word to hear it and see the Hebrew translation.
        </p>
        <p className="text-xs text-gray-400 mt-0.5" dir="rtl">
          קרא סיפורים קלאסיים באנגלית — לחץ על כל מילה לתרגום
        </p>
      </div>

      {/* Story grid */}
      <div className="grid grid-cols-1 gap-4">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>

      {/* Attribution */}
      <p className="text-xs text-gray-300 text-center mt-8">
        All stories are adapted from public-domain works (Brothers Grimm, Hans Christian Andersen, Charles Perrault, Madame de Beaumont).
      </p>
    </div>
  )
}
