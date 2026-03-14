import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Story } from '@/lib/stories'
import { cn } from '@/lib/utils'

const DIFFICULTY_STYLE: Record<Story['difficulty'], string> = {
  'beginner': 'bg-green-100 text-green-700',
  'easy-intermediate': 'bg-yellow-100 text-yellow-700',
  'intermediate': 'bg-orange-100 text-orange-700',
}

const DIFFICULTY_LABEL: Record<Story['difficulty'], string> = {
  'beginner': 'Beginner',
  'easy-intermediate': 'Easy-Int',
  'intermediate': 'Intermediate',
}

export default function StoryCard({ story }: { story: Story }) {
  return (
    <Link href={`/stories/${story.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-200 overflow-hidden">
        {/* Cover strip */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 px-5 pt-5 pb-3 flex items-center gap-3">
          <span className="text-4xl" role="img" aria-label={story.title}>
            {story.coverEmoji}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-indigo-700 transition-colors truncate">
              {story.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{story.author}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-3">
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-1">
            {story.description}
          </p>
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-1" dir="rtl">
            {story.descriptionHe}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', DIFFICULTY_STYLE[story.difficulty])}>
              {DIFFICULTY_LABEL[story.difficulty]}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              ~{story.wordCount} words
            </span>
          </div>
          <span className="text-xs text-indigo-500 font-medium group-hover:text-indigo-700 transition-colors">
            Read →
          </span>
        </div>
      </div>
    </Link>
  )
}
