export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to LiveSign
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Multi-tenant digital signage platform for modern businesses
          </p>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">🚧 Under Construction</h2>
              <p className="text-gray-600">
                Building multi-tenant foundation with Next.js 14 & Supabase
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-2">Planned Features:</h3>
              <ul className="text-left text-gray-600 space-y-1">
                <li>✅ Multi-tenant architecture</li>
                <li>✅ Organization-based access control</li>
                <li>✅ User invitation system</li>
                <li>✅ Role-based permissions</li>
                <li>🚧 Digital signage management</li>
                <li>🚧 Content scheduling</li>
                <li>🚧 Real-time updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}