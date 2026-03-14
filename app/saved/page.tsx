import { Metadata } from 'next'
import SavedWordsPageClient from './SavedWordsPageClient'

export const metadata: Metadata = {
  title: 'Saved Words — Englingo',
  description: 'Your saved English vocabulary with Hebrew translations.',
}

export default function SavedWordsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Words</h1>
        <p className="text-gray-500 mt-1" dir="rtl" lang="he">
          מילים שמורות
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Your personal English vocabulary list. Click &ldquo;Practice&rdquo; to generate sentences with a word.
        </p>
      </div>

      <SavedWordsPageClient />
    </div>
  )
}
