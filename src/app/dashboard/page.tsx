import { redirect } from 'next/navigation'
import { getUserWithProfile, getUserOrganizations } from '@/lib/auth'
import { OrganizationSelector } from '@/components/dashboard/organization-selector'

export default async function Dashboard() {
  const { user, profile } = await getUserWithProfile()
  
  if (!user) {
    redirect('/auth/signin')
  }
  
  const organizations = await getUserOrganizations(user.id)
  
  // If user has only one organization, redirect directly to it
  if (organizations.length === 1) {
    const org = (organizations[0] as any).organizations
    if (org) {
      redirect(`/org/${org.slug}`)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to LiveSign
          </h1>
          <p className="text-lg text-gray-600 mb-12">
            Select an organization to continue
          </p>
        </div>
        
        {organizations.length === 0 ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                No Organizations Yet
              </h2>
              <p className="text-gray-600 mb-6">
                You don&apos;t belong to any organizations yet. Create your first organization or ask to be invited to an existing one.
              </p>
              <a
                href="/onboarding"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Organization
              </a>
            </div>
          </div>
        ) : (
          <OrganizationSelector organizations={organizations} />
        )}
      </div>
    </div>
  )
}