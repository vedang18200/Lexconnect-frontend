import type{ ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'w-full py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50'

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  }

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}
