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
      content: {
        Row: {
          id: string
          organization_id: string
          name: string
          type: 'image' | 'text'
          file_url: string | null
          file_size: number | null
          file_type: string | null
          width: number | null
          height: number | null
          title: string | null
          content_text: string | null
          background_color: string
          text_color: string
          font_family: string
          font_size: number
          thumbnail_url: string | null
          metadata: Record<string, any> | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          type: 'image' | 'text'
          file_url?: string | null
          file_size?: number | null
          file_type?: string | null
          width?: number | null
          height?: number | null
          title?: string | null
          content_text?: string | null
          background_color?: string
          text_color?: string
          font_family?: string
          font_size?: number
          thumbnail_url?: string | null
          metadata?: Record<string, any> | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          type?: 'image' | 'text'
          file_url?: string | null
          file_size?: number | null
          file_type?: string | null
          width?: number | null
          height?: number | null
          title?: string | null
          content_text?: string | null
          background_color?: string
          text_color?: string
          font_family?: string
          font_size?: number
          thumbnail_url?: string | null
          metadata?: Record<string, any> | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      slideshows: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          default_slide_duration: number
          transition_type: 'fade' | 'slide' | 'none'
          transition_duration: number
          auto_advance: boolean
          show_progress: boolean
          background_color: string
          view_count: number
          last_viewed_at: string | null
          is_active: boolean
          published_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          default_slide_duration?: number
          transition_type?: 'fade' | 'slide' | 'none'
          transition_duration?: number
          auto_advance?: boolean
          show_progress?: boolean
          background_color?: string
          view_count?: number
          last_viewed_at?: string | null
          is_active?: boolean
          published_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          default_slide_duration?: number
          transition_type?: 'fade' | 'slide' | 'none'
          transition_duration?: number
          auto_advance?: boolean
          show_progress?: boolean
          background_color?: string
          view_count?: number
          last_viewed_at?: string | null
          is_active?: boolean
          published_at?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      slideshow_slides: {
        Row: {
          id: string
          slideshow_id: string
          content_id: string
          slide_order: number
          duration: number
          transition_type: string | null
          metadata: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slideshow_id: string
          content_id: string
          slide_order: number
          duration?: number
          transition_type?: string | null
          metadata?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slideshow_id?: string
          content_id?: string
          slide_order?: number
          duration?: number
          transition_type?: string | null
          metadata?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      display_sessions: {
        Row: {
          id: string
          slideshow_id: string
          session_id: string
          ip_address: string | null
          user_agent: string | null
          started_at: string
          last_ping_at: string
          ended_at: string | null
          total_duration: number
          slides_viewed: number
          created_at: string
        }
        Insert: {
          id?: string
          slideshow_id: string
          session_id: string
          ip_address?: string | null
          user_agent?: string | null
          started_at?: string
          last_ping_at?: string
          ended_at?: string | null
          total_duration?: number
          slides_viewed?: number
          created_at?: string
        }
        Update: {
          id?: string
          slideshow_id?: string
          session_id?: string
          ip_address?: string | null
          user_agent?: string | null
          started_at?: string
          last_ping_at?: string
          ended_at?: string | null
          total_duration?: number
          slides_viewed?: number
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
export type Content = Database['public']['Tables']['content']['Row']
export type Slideshow = Database['public']['Tables']['slideshows']['Row']
export type SlideshowSlide = Database['public']['Tables']['slideshow_slides']['Row']
export type DisplaySession = Database['public']['Tables']['display_sessions']['Row']

export type CreateOrganization = Database['public']['Tables']['organizations']['Insert']
export type CreateUser = Database['public']['Tables']['users']['Insert']
export type CreateUserRole = Database['public']['Tables']['user_roles']['Insert']
export type CreateInvitation = Database['public']['Tables']['invitations']['Insert']
export type CreateContent = Database['public']['Tables']['content']['Insert']
export type CreateSlideshow = Database['public']['Tables']['slideshows']['Insert']
export type CreateSlideshowSlide = Database['public']['Tables']['slideshow_slides']['Insert']
export type CreateDisplaySession = Database['public']['Tables']['display_sessions']['Insert']

export type UpdateContent = Database['public']['Tables']['content']['Update']
export type UpdateSlideshow = Database['public']['Tables']['slideshows']['Update']
export type UpdateSlideshowSlide = Database['public']['Tables']['slideshow_slides']['Update']

// Extended types for UI
export type ContentWithSlides = Content & {
  slideshow_slides?: SlideshowSlide[]
}

export type SlideshowWithSlides = Slideshow & {
  slideshow_slides?: (SlideshowSlide & {
    content: Content
  })[]
  created_by_user?: Pick<User, 'id' | 'name' | 'email'>
}

export type SlideshowSlideWithContent = SlideshowSlide & {
  content: Content
}