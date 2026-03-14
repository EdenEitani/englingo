'use client'

import { DailyStats } from '@/lib/types'
import { BookOpen, Headphones, Star } from 'lucide-react'

interface ProgressBarProps {
  stats: DailyStats
}

export default function ProgressBar({ stats }: ProgressBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <StatCard
        icon={<BookOpen className="w-4 h-4" />}
        count={stats.sentences_learned}
        englishLabel="Sentences Learned"
        hebrewLabel="משפטים שנלמדו"
        color="indigo"
      />
      <StatCard
        icon={<Star className="w-4 h-4" />}
        count={stats.words_discovered}
        englishLabel="New Words"
        hebrewLabel="מילים חדשות"
        color="violet"
      />
      <StatCard
        icon={<Headphones className="w-4 h-4" />}
        count={stats.sentences_heard}
        englishLabel="Full Listens"
        hebrewLabel="האזנות שלמות"
        color="sky"
      />
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  count: number
  englishLabel: string
  hebrewLabel: string
  color: 'indigo' | 'violet' | 'sky'
}

function StatCard({ icon, count, englishLabel, hebrewLabel, color }: StatCardProps) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      count: 'text-indigo-700',
    },
    violet: {
      bg: 'bg-violet-50',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      count: 'text-violet-700',
    },
    sky: {
      bg: 'bg-sky-50',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      count: 'text-sky-700',
    },
  }

  const c = colorMap[color]

  return (
    <div className={`${c.bg} rounded-xl p-3 sm:p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`${c.iconBg} ${c.iconColor} p-1.5 rounded-lg`}>{icon}</div>
        <span className={`text-2xl font-bold ${c.count}`}>{count}</span>
      </div>
      <p className="text-gray-700 text-xs font-medium leading-tight">{englishLabel}</p>
      <p className="text-gray-500 text-xs" dir="rtl">
        {hebrewLabel}
      </p>
    </div>
  )
}
