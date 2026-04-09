'use client'

import { useRouter } from 'next/navigation'

interface OrganizationData {
  organization_id: string
  organizations: {
    id: string
    name: string
    slug: string
    logo_url: string | null
    plan: string
  } | null
  roles: {
    name: string
    permissions: string[]
  } | null
}

interface OrganizationSelectorProps {
  organizations: OrganizationData[]
}

export function OrganizationSelector({ organizations }: OrganizationSelectorProps) {
  const router = useRouter()
  
  const handleOrganizationSelect = (slug: string) => {
    router.push(`/org/${slug}`)
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((item) => {
          const org = item.organizations
          const role = item.roles
          
          if (!org) return null
          
          return (
            <div
              key={org.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
              onClick={() => handleOrganizationSelect(org.slug)}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {org.logo_url ? (
                    <img
                      src={org.logo_url}
                      alt={`${org.name} logo`}
                      className="h-10 w-10 rounded-lg object-cover mr-3"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-lg">
                        {org.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {org.name}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {org.plan} plan
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {role?.name || 'Member'}
                  </span>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Create new organization card */}
        <div
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 border-dashed hover:border-blue-300"
          onClick={() => router.push('/onboarding')}
        >
          <div className="p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Create Organization
            </h3>
            <p className="text-sm text-gray-500">
              Start a new organization for your digital signage needs
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}