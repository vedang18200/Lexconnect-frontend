import Layout from '../components/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-900">Welcome to Lexconnect</h2>

        <p className="text-gray-600 max-w-2xl">
          This is your home page. Replace this with your Figma design components.
        </p>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
          <ul className="space-y-2 text-gray-600">
            <li>✓ React with TypeScript</li>
            <li>✓ Tailwind CSS for styling</li>
            <li>✓ React Router for navigation</li>
            <li>✓ Zustand for state management</li>
            <li>✓ React Hook Form for forms</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
