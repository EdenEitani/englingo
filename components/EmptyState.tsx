'use client'

import { BookOpen, Headphones, Globe } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
        <Globe className="w-10 h-10 text-indigo-500" />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Start Learning English
      </h2>
      <p className="text-gray-500 mb-2 text-lg">התחל ללמוד אנגלית</p>

      <p className="text-gray-400 max-w-md mb-10 text-sm leading-relaxed">
        Type any topic you&apos;re interested in and get 8 English practice sentences — tailored to your level.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl w-full">
        <FeatureCard
          icon={<Globe className="w-5 h-5 text-indigo-500" />}
          title="Any Topic"
          hebrew="כל נושא"
          description="Travel, food, sports, business..."
        />
        <FeatureCard
          icon={<Headphones className="w-5 h-5 text-indigo-500" />}
          title="Hear It"
          hebrew="שמע את זה"
          description="Native-sounding English audio"
        />
        <FeatureCard
          icon={<BookOpen className="w-5 h-5 text-indigo-500" />}
          title="Save Words"
          hebrew="שמור מילים"
          description="Build your vocabulary list"
        />
      </div>

      <div className="mt-10 flex flex-wrap gap-2 justify-center">
        {['travel ✈️', 'food 🍕', 'sports ⚽', 'business 💼', 'health 🏃', 'technology 💻'].map(
          (suggestion) => (
            <span
              key={suggestion}
              className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium border border-indigo-100"
            >
              {suggestion}
            </span>
          )
        )}
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  hebrew,
  description,
}: {
  icon: React.ReactNode
  title: string
  hebrew: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-left">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div>
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
          <span className="text-gray-400 text-xs block" dir="rtl">
            {hebrew}
          </span>
        </div>
      </div>
      <p className="text-gray-400 text-xs">{description}</p>
    </div>
  )
}
