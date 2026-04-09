import { getUserWithProfile, getUserOrganizations } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SlideshowDashboard } from '@/components/dashboard/slideshow-dashboard'

interface OrgDashboardProps {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'

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
        <SlideshowDashboard organizationId={org.id} />
      </div>
    </div>
  )
}