import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Lexconnect</h1>
            <p className="text-gray-600 font-medium">Legal Services Platform</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">{children}</div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Secure legal services platform
          </p>
        </div>
      </div>
    </div>
  )
}
