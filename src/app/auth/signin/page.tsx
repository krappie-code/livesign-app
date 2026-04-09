'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'


function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const [supabase] = useState(() => createClientComponentClient())

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          // Redirect to intended page or dashboard
          router.push(redirectTo || '/dashboard')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, router, redirectTo])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LiveSign</h1>
          <h2 className="text-xl text-gray-600 mb-8">
            Sign in to your account
          </h2>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Auth
            supabaseClient={supabase}
            view="sign_in"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#2563eb',
                  }
                }
              }
            }}
            providers={['google', 'github']}
            redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'}
            showLinks={true}
          />
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
}