import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerSupabaseClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

export const createRouteHandlerSupabaseClient = () => {
  return createRouteHandlerClient<Database>({ cookies })
}

export async function getUser() {
  const supabase = createServerSupabaseClient()
  
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function getUserWithProfile() {
  const supabase = createServerSupabaseClient()
  
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { user: null, profile: null }
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Error getting user profile:', profileError)
      return { user, profile: null }
    }
    
    return { user, profile }
  } catch (error) {
    console.error('Error getting user with profile:', error)
    return { user: null, profile: null }
  }
}

export async function getUserOrganizations(userId: string) {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        organization_id,
        role_id,
        organizations (
          id,
          name,
          slug,
          logo_url,
          plan
        ),
        roles (
          name,
          permissions
        )
      `)
      .eq('user_id', userId)
    
    if (error) {
      console.error('Error getting user organizations:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error getting user organizations:', error)
    return []
  }
}

export async function hasPermission(
  userId: string,
  organizationId: string,
  permission: string
): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        roles (
          permissions
        )
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single()
    
    if (error || !data) {
      return false
    }
    
    const permissions = (data as any).roles?.permissions || []
    
    // Check if user has wildcard permission
    if (permissions.includes('*')) {
      return true
    }
    
    // Check for specific permission
    return permissions.includes(permission)
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}