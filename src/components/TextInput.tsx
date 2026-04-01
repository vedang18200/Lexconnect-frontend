import type { InputHTMLAttributes } from 'react'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function TextInput({ label, error, ...props }: TextInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className={`w-full px-4 py-2.5 rounded-lg border-2 transition-colors focus:outline-none ${
          error
            ? 'border-red-500 focus:border-red-600'
            : 'border-gray-200 focus:border-blue-500'
        }`}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
