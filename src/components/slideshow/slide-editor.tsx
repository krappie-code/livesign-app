'use client'

import { useState, useCallback } from 'react'
import { Edit, Image as ImageIcon, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Content } from '@/types/database'
import { TextSlideCreator } from '../content/text-slide-creator'
import { ImageSlideCreator } from '../content/image-slide-creator'

interface SlideItem {
  id: string
  content: Content
  duration: number
  order: number
}

interface SlideEditorProps {
  slide: SlideItem
  slideIndex: number
  organizationId: string
  onUpdate: (updatedContent: Content) => void
  onDurationChange: (duration: number) => void
}

export function SlideEditor({ 
  slide, 
  slideIndex, 
  organizationId,
  onUpdate,
  onDurationChange
}: SlideEditorProps) {
  const [showTextEditor, setShowTextEditor] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)

  const durationOptions = [
    { value: 5, label: '5s' },
    { value: 10, label: '10s' },
    { value: 15, label: '15s' },
    { value: 30, label: '30s' },
    { value: 60, label: '1m' },
    { value: 300, label: '5m' }
  ]

  const handleEditClick = useCallback(() => {
    if (slide.content.type === 'text') {
      setShowTextEditor(true)
    } else if (slide.content.type === 'image') {
      setShowImageUpload(true)
    }
  }, [slide.content.type])

  const handleTextSlideUpdate = useCallback((updatedContent: Content) => {
    onUpdate(updatedContent)
    setShowTextEditor(false)
  }, [onUpdate])

  const handleImageSlideUpdate = useCallback((updatedContent: Content) => {
    onUpdate(updatedContent)
    setShowImageUpload(false)
  }, [onUpdate])

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* Slide Editor Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium text-gray-900">
            Slide {slideIndex + 1}
          </h2>
          <span className="text-sm text-gray-500">
            {slide.content.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Duration Selector */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <select
              value={slide.duration}
              onChange={(e) => onDurationChange(parseInt(e.target.value))}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {durationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Edit Button */}
          <Button
            onClick={handleEditClick}
            size="sm"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Slide Preview */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-4xl shadow-lg">
          <CardContent className="p-0">
            <div 
              className="aspect-video w-full bg-gray-900 relative cursor-pointer group"
              onClick={handleEditClick}
            >
              {/* Edit Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  <span className="text-sm font-medium">Click to edit</span>
                </div>
              </div>

              {/* Slide Content */}
              {slide.content.type === 'image' ? (
                <img
                  src={slide.content.file_url!}
                  alt={slide.content.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
                  style={{
                    backgroundColor: slide.content.background_color,
                    color: slide.content.text_color,
                    fontFamily: slide.content.font_family
                  }}
                >
                  {slide.content.title && (
                    <h1 
                      className="font-bold mb-6 break-words max-w-full"
                      style={{ 
                        fontSize: `${Math.min(slide.content.font_size * 1.5, 72)}px`,
                        lineHeight: '1.2'
                      }}
                    >
                      {slide.content.title}
                    </h1>
                  )}
                  {slide.content.content_text && (
                    <p 
                      className="break-words max-w-full"
                      style={{ 
                        fontSize: `${slide.content.font_size}px`,
                        lineHeight: '1.4'
                      }}
                    >
                      {slide.content.content_text}
                    </p>
                  )}
                  {!slide.content.title && !slide.content.content_text && (
                    <div className="text-gray-400 italic">
                      <div className="text-4xl mb-4">📝</div>
                      <p>Click to add text content</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slide Properties Panel */}
      <div className="bg-white border-t border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Slide Properties</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <div className="flex items-center gap-1 mt-1">
              {slide.content.type === 'image' ? (
                <ImageIcon className="h-4 w-4 text-blue-500" />
              ) : (
                <Edit className="h-4 w-4 text-green-500" />
              )}
              <span className="capitalize">{slide.content.type}</span>
            </div>
          </div>
          
          <div>
            <span className="text-gray-500">Duration:</span>
            <div className="mt-1 font-medium">{slide.duration} seconds</div>
          </div>

          {slide.content.type === 'text' && (
            <>
              <div>
                <span className="text-gray-500">Font:</span>
                <div className="mt-1 font-medium">{slide.content.font_family}</div>
              </div>
              <div>
                <span className="text-gray-500">Font Size:</span>
                <div className="mt-1 font-medium">{slide.content.font_size}px</div>
              </div>
            </>
          )}

          {slide.content.type === 'image' && slide.content.width && slide.content.height && (
            <>
              <div>
                <span className="text-gray-500">Dimensions:</span>
                <div className="mt-1 font-medium">{slide.content.width} × {slide.content.height}</div>
              </div>
              <div>
                <span className="text-gray-500">File Size:</span>
                <div className="mt-1 font-medium">
                  {slide.content.file_size ? Math.round(slide.content.file_size / 1024) + ' KB' : 'Unknown'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Text Editor Modal */}
      {showTextEditor && slide.content.type === 'text' && (
        <TextSlideCreator
          organizationId={organizationId}
          editContent={slide.content}
          onSave={handleTextSlideUpdate}
          onCancel={() => setShowTextEditor(false)}
        />
      )}

      {/* Image Slide Editor Modal */}
      {showImageUpload && slide.content.type === 'image' && (
        <ImageSlideCreator
          organizationId={organizationId}
          editContent={slide.content}
          onSave={handleImageSlideUpdate}
          onCancel={() => setShowImageUpload(false)}
        />
      )}
    </div>
  )
}