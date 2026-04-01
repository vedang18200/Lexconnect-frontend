import Layout from '../components/Layout'
import { useAuthStore } from '../stores/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Logged in as: <span className="font-semibold capitalize">{user?.role}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          {[
            { title: 'Active Cases', value: '12', icon: '📋' },
            { title: 'Messages', value: '5', icon: '💬' },
            { title: 'Profile', value: 'Complete', icon: '✅' },
          ].map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-2">{card.icon}</div>
              <p className="text-gray-600 text-sm">{card.title}</p>
              <p className="text-2xl font-bold mt-2">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Getting Started</h2>
          <p className="text-gray-700">
            Start by completing your profile and exploring the platform features.
          </p>
        </div>
      </div>
    </Layout>
  )
}
