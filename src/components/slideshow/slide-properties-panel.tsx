'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Clock, Palette, Type, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Content } from '@/types/database'

interface SlideItem {
  id: string
  content: Content
  duration: number
  order: number
}

interface SlidePropertiesPanelProps {
  slide: SlideItem | null
  slideIndex: number | null
  onDurationChange: (duration: number) => void
  onEdit: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function SlidePropertiesPanel({
  slide,
  slideIndex,
  onDurationChange,
  onEdit,
  isCollapsed,
  onToggleCollapse
}: SlidePropertiesPanelProps) {
  const [activeSection, setActiveSection] = useState<string>('timing')

  if (!slide) {
    return (
      <div className={`bg-white border-l border-gray-200 transition-all ${isCollapsed ? 'w-0 overflow-hidden' : 'w-80'}`}>
        {!isCollapsed && (
          <div className="p-6 text-center text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <p>Select a slide to view properties</p>
          </div>
        )}
      </div>
    )
  }

  const durationOptions = [
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' },
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' }
  ]

  const PropertySection = ({ 
    id, 
    title, 
    icon: Icon, 
    children 
  }: { 
    id: string
    title: string
    icon: React.ElementType
    children: React.ReactNode 
  }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setActiveSection(activeSection === id ? '' : id)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {activeSection === id ? (
          <ChevronDown className="h-3 w-3 text-gray-400" />
        ) : (
          <ChevronRight className="h-3 w-3 text-gray-400" />
        )}
      </button>
      
      {activeSection === id && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div className={`bg-white border-l border-gray-200 flex flex-col transition-all ${isCollapsed ? 'w-0 overflow-hidden' : 'w-80'}`}>
      {!isCollapsed && (
        <>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Slide {slideIndex! + 1} Properties
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Slide Overview */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                {slide.content.type === 'image' ? (
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <Type className="h-5 w-5 text-green-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{slide.content.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{slide.content.type} slide</p>
                </div>
              </div>
              
              <Button
                onClick={onEdit}
                size="sm"
                className="w-full"
              >
                Edit Slide
              </Button>
            </div>

            {/* Property Sections */}
            <div className="divide-y divide-gray-200">
              {/* Timing */}
              <PropertySection id="timing" title="Timing" icon={Clock}>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Display Duration
                  </label>
                  <select
                    value={slide.duration}
                    onChange={(e) => onDurationChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  How long this slide will be displayed before advancing to the next slide.
                </div>
              </PropertySection>

              {/* Appearance */}
              {slide.content.type === 'text' && (
                <PropertySection id="appearance" title="Appearance" icon={Palette}>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: slide.content.background_color }}
                        />
                        <span className="text-sm font-mono text-gray-600">
                          {slide.content.background_color}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: slide.content.text_color }}
                        />
                        <span className="text-sm font-mono text-gray-600">
                          {slide.content.text_color}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Font Family
                      </label>
                      <p className="text-sm text-gray-600">{slide.content.font_family}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Font Size
                      </label>
                      <p className="text-sm text-gray-600">{slide.content.font_size}px</p>
                    </div>
                  </div>
                </PropertySection>
              )}

              {/* Content Info */}
              <PropertySection id="content" title="Content" icon={slide.content.type === 'image' ? ImageIcon : Type}>
                <div className="space-y-3 text-sm">
                  {slide.content.type === 'text' ? (
                    <>
                      {slide.content.title && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <p className="text-gray-600 break-words">{slide.content.title}</p>
                        </div>
                      )}
                      {slide.content.content_text && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Content
                          </label>
                          <p className="text-gray-600 break-words text-xs leading-relaxed">
                            {slide.content.content_text}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {slide.content.width && slide.content.height && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Dimensions
                          </label>
                          <p className="text-gray-600">{slide.content.width} × {slide.content.height} px</p>
                        </div>
                      )}
                      {slide.content.file_size && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            File Size
                          </label>
                          <p className="text-gray-600">{Math.round(slide.content.file_size / 1024)} KB</p>
                        </div>
                      )}
                      {slide.content.file_type && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            File Type
                          </label>
                          <p className="text-gray-600 uppercase">{slide.content.file_type.split('/')[1]}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </PropertySection>
            </div>
          </div>
        </>
      )}

      {/* Collapsed State Toggle */}
      {isCollapsed && (
        <div className="w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="fixed right-4 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-white border border-gray-200 shadow-sm z-10"
          >
            <ChevronRight className="h-3 w-3 rotate-180" />
          </Button>
        </div>
      )}
    </div>
  )
}