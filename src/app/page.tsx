import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to LiveSign
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create, manage, and display professional digital signage with ease. 
            Upload content, build slideshows, and deploy to any screen instantly.
          </p>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link 
              href="/auth/signup" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
            <Link 
              href="/auth/signin" 
              className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold border border-gray-300 transition-colors shadow-lg"
            >
              Sign In
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🖼️</div>
              <h3 className="text-lg font-semibold mb-2">Easy Content Management</h3>
              <p className="text-gray-600">
                Upload images and create text slides with our intuitive drag & drop interface
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🎬</div>
              <h3 className="text-lg font-semibold mb-2">Slideshow Builder</h3>
              <p className="text-gray-600">
                Arrange content, set timing, and preview your slideshows in real-time
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📺</div>
              <h3 className="text-lg font-semibold mb-2">Instant Deployment</h3>
              <p className="text-gray-600">
                Get a shareable URL and display on any screen with fullscreen auto-play
              </p>
            </div>
          </div>

          <div className="mt-12 bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Perfect for:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>• Retail stores & shops</div>
              <div>• Office lobbies</div>
              <div>• Restaurants & cafes</div>
              <div>• Event venues</div>
              <div>• Public displays</div>
              <div>• Team dashboards</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}