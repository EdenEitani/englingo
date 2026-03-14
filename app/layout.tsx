import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Englingo — Learn English in Context',
  description:
    'Hebrew-to-English learning app. Generate practice sentences on any topic, hear them, click words for instant Hebrew translations.',
  keywords: ['English learning', 'Hebrew', 'language learning', 'EFL', 'vocabulary'],
  openGraph: {
    title: 'Englingo — Learn English in Context',
    description: 'Hebrew-to-English learning app with AI-generated sentences and instant translations.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Google Fonts for Hebrew support */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-slate-50">
        {/* Navigation Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <span className="font-bold text-lg text-gray-900 leading-none block">Englingo</span>
                <span className="text-xs text-gray-400 leading-none" dir="rtl">
                  ללמוד אנגלית
                </span>
              </div>
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-1">
              <NavLink href="/" label="Practice" hebrewLabel="תרגול" />
              <NavLink href="/stories" label="Stories" hebrewLabel="סיפורים" />
              <NavLink href="/saved" label="Saved" hebrewLabel="שמורות" />
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>

        {/* Footer */}
        <footer className="max-w-2xl mx-auto px-4 py-8 text-center">
          <p className="text-xs text-gray-400">
            Englingo — Learn English the smart way
          </p>
          <p className="text-xs text-gray-300 mt-1" dir="rtl">
            ללמוד אנגלית בדרך החכמה
          </p>
        </footer>
      </body>
    </html>
  )
}

function NavLink({
  href,
  label,
  hebrewLabel,
}: {
  href: string
  label: string
  hebrewLabel: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-gray-600 transition-all duration-150 group"
    >
      <span className="text-sm font-medium group-hover:text-indigo-600">{label}</span>
      <span className="text-xs text-gray-400 group-hover:text-indigo-400" dir="rtl">
        {hebrewLabel}
      </span>
    </Link>
  )
}
