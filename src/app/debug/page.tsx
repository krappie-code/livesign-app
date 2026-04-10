'use client'

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Environment Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
            <div className="space-y-2 font-mono text-sm">
              <div>
                <span className="font-semibold">NEXT_PUBLIC_SUPABASE_URL:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? "text-green-600" : "text-red-600"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ Not set"}
                </span>
              </div>
              <div>
                <span className="font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "text-green-600" : "text-red-600"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
                    `✅ Set (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...)` : 
                    "❌ Not set"
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Browser Environment</h2>
            <div className="space-y-2 font-mono text-sm">
              <div>
                <span className="font-semibold">window.location.origin:</span>
                <span className="text-blue-600">
                  {typeof window !== 'undefined' ? window.location.origin : 'Server-side render'}
                </span>
              </div>
              <div>
                <span className="font-semibold">NODE_ENV:</span>
                <span className="text-blue-600">{process.env.NODE_ENV}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Supabase Client Test</h2>
            <div className="text-sm">
              {process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                <div className="text-green-600">✅ Environment variables present - Supabase client should work</div>
              ) : (
                <div className="text-red-600">❌ Missing environment variables - Supabase client will fail</div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="text-sm text-gray-600">
              <p>If environment variables are missing:</p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Check Vercel project settings → Environment Variables</li>
                <li>Ensure NEXT_PUBLIC_ prefix on public variables</li>
                <li>Redeploy without build cache</li>
                <li>Check deployment logs for errors</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}