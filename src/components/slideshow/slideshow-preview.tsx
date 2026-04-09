'use client'

import { useState, useEffect, useCallback } from 'react'
import { Content } from '@/types/database'
import { Button } from '@/components/ui/button'
import { X, Play, Pause, SkipForward, SkipBack } from 'lucide-react'
import { ContentPreview } from '../content/content-preview'

interface SlideshowPreviewProps {
  slides: Content[]
  settings: {
    default_slide_duration: number
    transition_type: 'fade' | 'slide' | 'none'
    auto_advance: boolean
    background_color: string
  }
  onClose: () => void
}

export function SlideshowPreview({ slides, settings, onClose }: SlideshowPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [remainingTime, setRemainingTime] = useState(settings.default_slide_duration)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setProgress(0)
    setRemainingTime(settings.default_slide_duration)
  }, [slides.length, settings.default_slide_duration])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setProgress(0)
    setRemainingTime(settings.default_slide_duration)
  }, [slides.length, settings.default_slide_duration])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying && settings.auto_advance) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + (100 / (settings.default_slide_duration * 10))
          
          if (newProgress >= 100) {
            nextSlide()
            return 0
          }
          
          return newProgress
        })

        setRemainingTime((prev) => {
          const newTime = prev - 0.1
          return newTime > 0 ? newTime : settings.default_slide_duration
        })
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isPlaying, settings.auto_advance, settings.default_slide_duration, nextSlide])

  // Keyboard controls
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      switch (event.code) {
        case 'Space':
          event.preventDefault()
          setIsPlaying(prev => !prev)
          break
        case 'ArrowLeft':
          event.preventDefault()
          prevSlide()
          break
        case 'ArrowRight':
          event.preventDefault()
          nextSlide()
          break
        case 'Escape':
          event.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide, onClose])

  const currentContent = slides[currentSlide]
  if (!currentContent) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Slideshow Preview</h1>
            <div className="text-sm opacity-75">
              Slide {currentSlide + 1} of {slides.length}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Slide Display */}
      <div 
        className="flex-1 flex items-center justify-center p-8"
        style={{ backgroundColor: settings.background_color }}
      >
        <div className={`
          w-full h-full max-w-6xl mx-auto transition-all duration-1000
          ${settings.transition_type === 'fade' ? 'animate-fade-in' : ''}
        `}>
          {currentContent.type === 'image' ? (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={currentContent.file_url!}
                alt={currentContent.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center p-8"
              style={{
                backgroundColor: currentContent.background_color,
                color: currentContent.text_color,
                fontFamily: currentContent.font_family
              }}
            >
              <div className="text-center max-w-4xl">
                {currentContent.title && (
                  <h1
                    className="font-bold mb-8"
                    style={{ fontSize: `${currentContent.font_size * 1.5}px` }}
                  >
                    {currentContent.title}
                  </h1>
                )}
                {currentContent.content_text && (
                  <p style={{ fontSize: `${currentContent.font_size}px` }}>
                    {currentContent.content_text}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Progress Bar */}
      {settings.auto_advance && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="bg-white/20 h-1">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="bg-gradient-to-t from-black/50 to-transparent p-4">
            <div className="flex items-center justify-between text-white text-sm">
              <div className="opacity-75">
                {currentContent.name}
              </div>
              <div className="opacity-75">
                {Math.ceil(remainingTime)}s remaining
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white/60 text-xs space-y-1">
        <div>Space: Play/Pause</div>
        <div>←/→: Previous/Next</div>
        <div>Esc: Exit</div>
      </div>
    </div>
  )
}