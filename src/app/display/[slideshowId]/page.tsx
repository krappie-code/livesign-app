'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SlideshowWithSlides, CreateDisplaySession } from '@/types/database'
import { v4 as uuidv4 } from 'uuid'

interface DisplaySlide {
  id: string
  content: {
    id: string
    type: 'image' | 'text'
    name: string
    file_url?: string
    title?: string
    content_text?: string
    background_color: string
    text_color: string
    font_family: string
    font_size: number
  }
  duration: number
  order: number
}

export default function DisplayPage() {
  const { slideshowId } = useParams()
  const [slideshow, setSlideshow] = useState<SlideshowWithSlides | null>(null)
  const [slides, setSlides] = useState<DisplaySlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState(() => uuidv4())
  const sessionStartTime = useRef(Date.now())
  const slideStartTime = useRef(Date.now())
  const intervalRef = useRef<NodeJS.Timeout>()
  const pingIntervalRef = useRef<NodeJS.Timeout>()
  const totalSlidesViewed = useRef(0)

  // Load slideshow data
  useEffect(() => {
    async function loadSlideshow() {
      try {
        const { data, error } = await supabase
          .from('slideshows')
          .select(`
            *,
            slideshow_slides (
              id,
              slide_order,
              duration,
              content (
                id,
                type,
                name,
                file_url,
                title,
                content_text,
                background_color,
                text_color,
                font_family,
                font_size
              )
            )
          `)
          .eq('id', slideshowId)
          .eq('is_active', true)
          .single()

        if (error) {
          setError(error.message)
          return
        }

        if (!data) {
          setError('Slideshow not found or not active')
          return
        }

        setSlideshow(data)
        
        // Process slides
        const processedSlides: DisplaySlide[] = (data.slideshow_slides || [])
          .sort((a: any, b: any) => a.slide_order - b.slide_order)
          .map((slide: any, index: number) => ({
            id: slide.id,
            content: slide.content,
            duration: slide.duration,
            order: index + 1
          }))

        setSlides(processedSlides)

        if (processedSlides.length > 0) {
          // Increment view count
          await supabase.rpc('increment_slideshow_views', {
            slideshow_uuid: slideshowId
          })

          // Create display session for analytics
          const sessionData: CreateDisplaySession = {
            slideshow_id: slideshowId as string,
            session_id: sessionId,
            ip_address: null, // Will be set by backend if needed
            user_agent: navigator.userAgent
          }

          await supabase
            .from('display_sessions')
            .insert(sessionData)
        }
      } catch (err) {
        console.error('Error loading slideshow:', err)
        setError('Failed to load slideshow')
      } finally {
        setLoading(false)
      }
    }

    if (slideshowId) {
      loadSlideshow()
    }
  }, [slideshowId, sessionId])

  // Auto-advance slides
  const nextSlide = useCallback(() => {
    if (slides.length === 0) return

    setCurrentSlide(prev => {
      const next = (prev + 1) % slides.length
      totalSlidesViewed.current++
      slideStartTime.current = Date.now()
      return next
    })
  }, [slides.length])

  // Start slideshow
  useEffect(() => {
    if (!slideshow?.auto_advance || slides.length === 0) return

    const currentSlideDuration = slides[currentSlide]?.duration || slideshow.default_slide_duration
    
    intervalRef.current = setTimeout(() => {
      nextSlide()
    }, currentSlideDuration * 1000)

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [currentSlide, slideshow, slides, nextSlide])

  // Periodic session ping for analytics
  useEffect(() => {
    if (slides.length === 0) return

    pingIntervalRef.current = setInterval(async () => {
      const totalDuration = Math.floor((Date.now() - sessionStartTime.current) / 1000)
      
      await supabase
        .from('display_sessions')
        .update({
          last_ping_at: new Date().toISOString(),
          total_duration: totalDuration,
          slides_viewed: totalSlidesViewed.current
        })
        .eq('session_id', sessionId)
    }, 30000) // Ping every 30 seconds

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
    }
  }, [slides.length, sessionId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // End session
      const totalDuration = Math.floor((Date.now() - sessionStartTime.current) / 1000)
      
      supabase
        .from('display_sessions')
        .update({
          ended_at: new Date().toISOString(),
          total_duration: totalDuration,
          slides_viewed: totalSlidesViewed.current
        })
        .eq('session_id', sessionId)
        .then(() => {
          console.log('Display session ended')
        })
    }
  }, [sessionId])

  // Keyboard controls (for testing/management)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        nextSlide()
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        // Could add exit functionality here
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, slides.length])

  // Fullscreen on load
  useEffect(() => {
    // Try to enter fullscreen on user interaction
    function enterFullscreen() {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(console.warn)
      }
    }

    // Enter fullscreen on first click
    document.addEventListener('click', enterFullscreen, { once: true })
    
    return () => {
      document.removeEventListener('click', enterFullscreen)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading slideshow...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Display Error</h1>
          <p className="text-xl mb-8">{error}</p>
          <p className="text-gray-400">Please check the slideshow URL or contact support</p>
        </div>
      </div>
    )
  }

  if (!slideshow || slides.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">No Content</h1>
          <p className="text-xl mb-8">This slideshow has no slides to display</p>
          <p className="text-gray-400">Please add content to the slideshow</p>
        </div>
      </div>
    )
  }

  const currentSlideData = slides[currentSlide]
  const currentContent = currentSlideData.content

  return (
    <div 
      className="min-h-screen flex items-center justify-center transition-all duration-1000"
      style={{ backgroundColor: slideshow.background_color }}
    >
      {/* Hide cursor after inactivity */}
      <style jsx>{`
        body {
          cursor: none;
          overflow: hidden;
        }
        * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>

      {currentContent.type === 'image' ? (
        // Image Slide
        <div className="w-full h-full flex items-center justify-center p-8">
          <img
            key={currentSlideData.id} // Force re-render for transitions
            src={currentContent.file_url!}
            alt={currentContent.name}
            className={`
              max-w-full max-h-full object-contain
              ${slideshow.transition_type === 'fade' ? 'animate-fade-in' : ''}
            `}
            onError={(e) => {
              console.error('Failed to load image:', currentContent.file_url)
              // Could show a fallback or skip to next slide
            }}
          />
        </div>
      ) : (
        // Text Slide
        <div
          key={currentSlideData.id} // Force re-render for transitions
          className={`
            w-full h-full flex items-center justify-center p-12
            ${slideshow.transition_type === 'fade' ? 'animate-fade-in' : ''}
          `}
          style={{
            backgroundColor: currentContent.background_color,
            color: currentContent.text_color,
            fontFamily: currentContent.font_family
          }}
        >
          <div className="text-center max-w-6xl">
            {currentContent.title && (
              <h1
                className="font-bold mb-8"
                style={{ 
                  fontSize: `${Math.min(currentContent.font_size * 1.5, 128)}px`,
                  lineHeight: '1.2'
                }}
              >
                {currentContent.title}
              </h1>
            )}
            {currentContent.content_text && (
              <div
                style={{ 
                  fontSize: `${currentContent.font_size}px`,
                  lineHeight: '1.5'
                }}
              >
                {/* Support basic line breaks */}
                {currentContent.content_text.split('\n').map((line, index) => (
                  <p key={index} className={index > 0 ? 'mt-4' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Optional progress indicator (subtle) */}
      {slideshow.show_progress && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentSlide 
                    ? 'bg-white opacity-80 scale-125' 
                    : 'bg-white opacity-30'
                  }
                `}
              />
            ))}
          </div>
        </div>
      )}

      {/* Service worker for offline support */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js').catch(console.warn);
            }
          `
        }}
      />
    </div>
  )
}