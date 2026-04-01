import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-light dark:bg-dark">
      <header className="bg-white dark:bg-gray-900 shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-primary">Lexconnect</h1>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  )
}
