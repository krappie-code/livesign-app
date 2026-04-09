import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/types/database'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth', '/auth/callback', '/api/auth']
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route + '/')
  )

  // Handle invitation acceptance route
  if (req.nextUrl.pathname.startsWith('/invite/')) {
    // Allow access to invitation pages even without session
    return res
  }

  // Handle organization-scoped routes
  const orgMatch = req.nextUrl.pathname.match(/^\/org\/([^\/]+)(.*)$/)
  if (orgMatch) {
    const [, orgSlug, path] = orgMatch

    // Require authentication for organization routes
    if (!session) {
      const redirectUrl = new URL('/auth/signin', req.url)
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user has access to this organization
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select(`
        organization_id,
        organizations!inner(slug)
      `)
      .eq('user_id', session.user.id)
      .eq('organizations.slug', orgSlug)
      .single()

    if (error || !userRoles) {
      // User doesn't have access to this organization
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    // Add organization context to headers for use in components
    res.headers.set('x-organization-id', (userRoles as any).organization_id)
    res.headers.set('x-organization-slug', orgSlug)

    return res
  }

  // Redirect authenticated users from auth pages to dashboard
  if (session && req.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Require authentication for protected routes
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/auth/signin', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}