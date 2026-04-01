import type { UserRole } from '../types/auth'

interface RoleSelectorProps {
  selectedRole: UserRole
  onSelectRole: (role: UserRole) => void
}

const roles: { id: UserRole; label: string; description: string; icon: string }[] = [
  {
    id: 'citizen',
    label: 'Citizen',
    description: 'Access legal services and find lawyers',
    icon: '👤',
  },
  {
    id: 'lawyer',
    label: 'Lawyer',
    description: 'Manage your legal practice',
    icon: '⚖️',
  },
  {
    id: 'social-worker',
    label: 'Social Worker',
    description: 'Provide legal assistance support',
    icon: '🤝',
  },
]

export default function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  return (
    <div className="space-y-3 mb-8">
      {roles.map((role) => (
        <button
          key={role.id}
          onClick={() => onSelectRole(role.id)}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
            selectedRole === role.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{role.icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{role.label}</p>
              <p className="text-sm text-gray-600">{role.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
