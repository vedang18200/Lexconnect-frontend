import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import type { LoginFormData, UserRole } from '../types/auth'
import TextInput from './TextInput'
import Button from './Button'
import RoleSelector from './RoleSelector'

export default function LoginForm() {
  const navigate = useNavigate()
  const { setUser, setRole } = useAuthStore()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginFormData>()
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Set user in store
      setUser({
        id: '1',
        email: data.email,
        role: selectedRole,
        name: data.email.split('@')[0],
      })
      setRole(selectedRole)

      // Navigate to dashboard
      navigate(`/dashboard`)
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
      reset()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Role Selector */}
      <RoleSelector selectedRole={selectedRole} onSelectRole={setSelectedRole} />

      {/* Role Title */}
      <div className="border-t pt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
          {selectedRole} Login
        </h2>
        <p className="text-gray-600 text-sm">
          {selectedRole === 'citizen' && 'Access legal services and find lawyers'}
          {selectedRole === 'lawyer' && 'Manage your legal practice and clients'}
          {selectedRole === 'social-worker' && 'Provide legal assistance support'}
        </p>
      </div>

      {/* Email Input */}
      <TextInput
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="your@email.com"
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
        error={errors.email?.message}
      />

      {/* Password Input */}
      <TextInput
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
          },
        })}
        error={errors.password?.message}
      />

      {/* Demo Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <strong>Demo:</strong> Use any email/password combination to test
        </p>
      </div>

      {/* Login Button */}
      <Button type="submit" loading={loading} className="capitalize">
        Login as {selectedRole}
      </Button>

      {/* Additional Links */}
      <div className="space-y-2 text-center text-sm">
        <p>
          <a href="#" className="text-blue-600 hover:underline">
            Forgot password?
          </a>
        </p>
        <p className="text-gray-600">
          Don't have an account?{' '}
          <a href="#" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </form>
  )
}
