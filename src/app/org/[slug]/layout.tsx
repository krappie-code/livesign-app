import { notFound, redirect } from 'next/navigation'
import { getUserWithProfile, getUserOrganizations } from '@/lib/auth'
import { OrganizationLayout } from '@/components/dashboard/organization-layout'

interface OrganizationLayoutProps {
  children: React.ReactNode
  params: { slug: string }
}

export default async function OrgLayout({ children, params }: OrganizationLayoutProps) {
  const { user, profile } = await getUserWithProfile()
  
  if (!user) {
    redirect('/auth/signin')
  }
  
  const organizations = await getUserOrganizations(user.id)
  const currentOrg = organizations.find(
    (org) => (org as any).organizations?.slug === params.slug
  )
  
  if (!currentOrg || !(currentOrg as any).organizations) {
    notFound()
  }
  
  return (
    <OrganizationLayout 
      organization={(currentOrg as any).organizations}
      userRole={(currentOrg as any).roles}
      user={profile}
    >
      {children}
    </OrganizationLayout>
  )
}