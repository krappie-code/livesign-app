'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  const [organizationName, setOrganizationName] = useState('')
  const [slug, setSlug] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Generate slug from organization name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setOrganizationName(name)
    setSlug(generateSlug(name))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!organizationName.trim() || !slug.trim()) {
      setError('Organization name is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please log in to create an organization')
        return
      }

      // Create organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName.trim(),
          slug: slug.trim(),
        })
        .select()
        .single()

      if (orgError) {
        if (orgError.code === '23505') { // Unique constraint violation
          setError('Organization name is already taken. Please choose a different name.')
        } else {
          setError(`Error creating organization: ${orgError.message}`)
        }
        return
      }

      // Get owner role
      const { data: ownerRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'owner')
        .single()

      if (!ownerRole) {
        setError('System error: Owner role not found')
        return
      }

      // Add user as owner of the organization
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          organization_id: organization.id,
          role_id: ownerRole.id
        })

      if (roleError) {
        setError(`Error assigning role: ${roleError.message}`)
        return
      }

      // Update user's current organization
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ current_organization_id: organization.id })
        .eq('id', user.id)

      if (userUpdateError) {
        console.error('Warning: Could not update current organization:', userUpdateError)
        // Don't return error here as org creation was successful
      }

      // Redirect to organization dashboard
      router.push(`/org/${organization.slug}`)

    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to LiveSign!</h1>
          <h2 className="text-xl text-gray-600 mb-8">
            Create your organization to get started
          </h2>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                id="organizationName"
                type="text"
                value={organizationName}
                onChange={handleNameChange}
                placeholder="e.g. My Company, ACME Corp, John&apos;s Restaurant"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  livesign.app/org/
                </span>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="my-company"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-none rounded-r-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This will be your organization&apos;s unique URL. Only letters, numbers, and hyphens allowed.
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !organizationName.trim() || !slug.trim()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Organization...' : 'Create Organization'}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">What you&apos;ll get</span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Upload and manage content (images, text slides)
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Create and customize slideshows
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Deploy to any screen with a simple URL
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Invite team members and collaborate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}