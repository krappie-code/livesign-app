import { getUserWithProfile, getUserOrganizations } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface OrgDashboardProps {
  params: { slug: string }
}

export default async function OrgDashboard({ params }: OrgDashboardProps) {
  const { user } = await getUserWithProfile()
  
  if (!user) {
    redirect('/auth/signin')
  }
  
  const organizations = await getUserOrganizations(user.id)
  const currentOrg = organizations.find(
    (org) => (org as any).organizations?.slug === params.slug
  )
  
  if (!(currentOrg as any)?.organizations) {
    redirect('/dashboard')
  }
  
  const org = (currentOrg as any).organizations
  const role = (currentOrg as any).roles
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to {org.name}
          </h1>
          <p className="text-gray-600">
            Manage your digital signage content and displays from this dashboard
          </p>
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Displays</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Content Items</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Team Members</dt>
                    <dd className="text-lg font-medium text-gray-900">1</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Plan</dt>
                    <dd className="text-lg font-medium text-gray-900 capitalize">{org.plan}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="px-6 py-5 space-y-4">
              <a
                href={`/org/${params.slug}/signage/new`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900">Add Display</h4>
                    <p className="text-sm text-gray-500">Set up a new digital display</p>
                  </div>
                </div>
              </a>
              
              <a
                href={`/org/${params.slug}/content/new`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l13-8L7 4z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900">Upload Content</h4>
                    <p className="text-sm text-gray-500">Add images, videos, or other media</p>
                  </div>
                </div>
              </a>
              
              {(role?.name === 'owner' || role?.name === 'admin') && (
                <a
                  href={`/org/${params.slug}/users/invite`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-purple-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-gray-900">Invite Users</h4>
                      <p className="text-sm text-gray-500">Add team members to your organization</p>
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Getting Started</h3>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Organization Created</h4>
                    <p className="text-sm text-gray-500">Your organization is ready to use</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">2</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Set up your first display</h4>
                    <p className="text-sm text-gray-500">Add a digital signage display to get started</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">3</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Upload content</h4>
                    <p className="text-sm text-gray-500">Add images, videos, or create custom content</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">4</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Invite team members</h4>
                    <p className="text-sm text-gray-500">Collaborate with your team on content management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}