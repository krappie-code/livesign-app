export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          plan: string
          settings: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          plan?: string
          settings?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          plan?: string
          settings?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          current_organization_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          current_organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          current_organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: string[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          permissions?: string[]
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          role_id?: string
          created_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          email: string
          organization_id: string
          role_id: string
          invited_by: string
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          organization_id: string
          role_id: string
          invited_by: string
          token: string
          expires_at: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          organization_id?: string
          role_id?: string
          invited_by?: string
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Helper types
export type Organization = Database['public']['Tables']['organizations']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Role = Database['public']['Tables']['roles']['Row']
export type UserRole = Database['public']['Tables']['user_roles']['Row']
export type Invitation = Database['public']['Tables']['invitations']['Row']

export type CreateOrganization = Database['public']['Tables']['organizations']['Insert']
export type CreateUser = Database['public']['Tables']['users']['Insert']
export type CreateUserRole = Database['public']['Tables']['user_roles']['Insert']
export type CreateInvitation = Database['public']['Tables']['invitations']['Insert']