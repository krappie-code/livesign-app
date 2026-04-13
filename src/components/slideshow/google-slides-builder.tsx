'use client'

import { useState, useEffect, useCallback } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Content, Slideshow, SlideshowSlide, CreateSlideshow, CreateSlideshowSlide, SlideshowWithSlides } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SlideThumbnail } from './slide-thumbnail'
import { SlideEditor } from './slide-editor'
import { SlideToolbar } from './slide-toolbar'
import { SlidePropertiesPanel } from './slide-properties-panel'
import { SlideshowPreview } from './slideshow-preview'
import { SlideshowSettings } from './slideshow-settings'
import { TextSlideCreator } from '../content/text-slide-creator'
import { ImageSlideCreator } from '../content/image-slide-creator'
import { v4 as uuidv4 } from 'uuid'

interface GoogleSlidesBuilderProps {
  organizationId: string
  slideshow?: SlideshowWithSlides
  onSave?: (slideshow: Slideshow) => void
  onCancel?: () => void
}

interface SlideItem {
  id: string
  content: Content
  duration: number
  order: number
}

export function GoogleSlidesBuilder({ 
  organizationId, 
  slideshow,
  onSave,
  onCancel 
}: GoogleSlidesBuilderProps) {
  const [formData, setFormData] = useState({
    name: slideshow?.name || 'Untitled Slideshow',
    description: slideshow?.description || '',
    default_slide_duration: slideshow?.default_slide_duration || 10,
    transition_type: slideshow?.transition_type || 'fade' as 'fade' | 'slide' | 'none',
    auto_advance: slideshow?.auto_advance ?? true,
    background_color: slideshow?.background_color || '#000000'
  })

  const [slides, setSlides] = useState<SlideItem[]>([])
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0)
  const [showPreview, setShowPreview] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showTextCreator, setShowTextCreator] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [isPropertiesPanelCollapsed, setIsPropertiesPanelCollapsed] = useState(true)
  const [saving, setSaving] = useState(false)
  const [supabase, setSupabase] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize Supabase client safely
  useEffect(() => {
    try {
      const client = createClientComponentClient()
      setSupabase(client)
      setIsInitialized(true)
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err)
    }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  // Load slideshow slides
  useEffect(() => {
    if (slideshow?.slideshow_slides) {
      const sortedSlides = slideshow.slideshow_slides
        .sort((a, b) => a.slide_order - b.slide_order)
        .map((slide, index) => ({
          id: slide.id,
          content: slide.content,
          duration: slide.duration,
          order: index + 1
        }))
      setSlides(sortedSlides)
    }
  }, [slideshow])

  const selectedSlide = slides[selectedSlideIndex] || null

  function handleDragEnd(event: any) {
    const { active, over } = event

    if (active.id !== over.id) {
      setSlides((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Update order numbers and adjust selected slide index
        const reorderedItems = newItems.map((item, index) => ({
          ...item,
          order: index + 1
        }))

        // Update selected slide index if needed
        if (selectedSlideIndex === oldIndex) {
          setSelectedSlideIndex(newIndex)
        } else if (selectedSlideIndex > oldIndex && selectedSlideIndex <= newIndex) {
          setSelectedSlideIndex(selectedSlideIndex - 1)
        } else if (selectedSlideIndex < oldIndex && selectedSlideIndex >= newIndex) {
          setSelectedSlideIndex(selectedSlideIndex + 1)
        }
        
        return reorderedItems
      })
    }
  }

  const handleAddTextSlide = useCallback(() => {
    setShowTextCreator(true)
  }, [])

  const handleAddImageSlide = useCallback(() => {
    setShowImageUpload(true)
  }, [])

  const handleTextSlideCreated = useCallback((textContent: Content) => {
    const newSlide: SlideItem = {
      id: uuidv4(),
      content: textContent,
      duration: formData.default_slide_duration,
      order: slides.length + 1
    }
    
    setSlides(prev => [...prev, newSlide])
    setSelectedSlideIndex(slides.length) // Select the new slide
    setShowTextCreator(false)
  }, [slides.length, formData.default_slide_duration])

  const handleImageSlideCreated = useCallback((imageContent: Content) => {
    const newSlide: SlideItem = {
      id: uuidv4(),
      content: imageContent,
      duration: formData.default_slide_duration,
      order: slides.length + 1
    }
    
    setSlides(prev => [...prev, newSlide])
    setSelectedSlideIndex(slides.length) // Select the new slide
    setShowImageUpload(false)
  }, [slides.length, formData.default_slide_duration])

  const handleSlideSelect = useCallback((index: number) => {
    setSelectedSlideIndex(index)
  }, [])

  const handleSlideDelete = useCallback((slideIndex: number) => {
    setSlides(prev => {
      const newSlides = prev.filter((_, index) => index !== slideIndex)
      const reorderedSlides = newSlides.map((slide, index) => ({
        ...slide,
        order: index + 1
      }))
      
      // Adjust selected slide index
      if (slideIndex <= selectedSlideIndex && selectedSlideIndex > 0) {
        setSelectedSlideIndex(selectedSlideIndex - 1)
      } else if (slideIndex < selectedSlideIndex) {
        setSelectedSlideIndex(selectedSlideIndex - 1)
      } else if (reorderedSlides.length === 0) {
        setSelectedSlideIndex(0)
      } else if (selectedSlideIndex >= reorderedSlides.length) {
        setSelectedSlideIndex(reorderedSlides.length - 1)
      }
      
      return reorderedSlides
    })
  }, [selectedSlideIndex])

  const handleSlideDurationChange = useCallback((slideIndex: number, duration: number) => {
    setSlides(prev => prev.map((slide, index) => 
      index === slideIndex ? { ...slide, duration } : slide
    ))
  }, [])

  const handleSlideUpdate = useCallback((updatedContent: Content) => {
    if (selectedSlide) {
      setSlides(prev => prev.map(slide => 
        slide.id === selectedSlide.id ? { ...slide, content: updatedContent } : slide
      ))
    }
  }, [selectedSlide])

  const handlePropertiesPanelEdit = useCallback(() => {
    if (selectedSlide) {
      if (selectedSlide.content.type === 'text') {
        setShowTextCreator(true)
      } else if (selectedSlide.content.type === 'image') {
        setShowImageUpload(true)
      }
    }
  }, [selectedSlide])

  async function handleSave() {
    if (!supabase || !formData.name.trim()) return

    setSaving(true)
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) throw new Error('Not authenticated')

      let slideshowData: Slideshow
      
      if (slideshow) {
        // Update existing slideshow
        const { data, error } = await supabase
          .from('slideshows')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            default_slide_duration: formData.default_slide_duration,
            transition_type: formData.transition_type,
            auto_advance: formData.auto_advance,
            background_color: formData.background_color
          })
          .eq('id', slideshow.id)
          .select()
          .single()

        if (error) throw error
        slideshowData = data
      } else {
        // Create new slideshow
        const newSlideshow: CreateSlideshow = {
          organization_id: organizationId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          default_slide_duration: formData.default_slide_duration,
          transition_type: formData.transition_type,
          auto_advance: formData.auto_advance,
          background_color: formData.background_color,
          created_by: user.data.user.id
        }

        const { data, error } = await supabase
          .from('slideshows')
          .insert(newSlideshow)
          .select()
          .single()

        if (error) throw error
        slideshowData = data
      }

      // Delete existing slides if updating
      if (slideshow) {
        await supabase
          .from('slideshow_slides')
          .delete()
          .eq('slideshow_id', slideshow.id)
      }

      // Create new slides
      if (slides.length > 0) {
        const slidesData: CreateSlideshowSlide[] = slides.map((slide, index) => ({
          slideshow_id: slideshowData.id,
          content_id: slide.content.id,
          slide_order: index + 1,
          duration: slide.duration
        }))

        const { error: slidesError } = await supabase
          .from('slideshow_slides')
          .insert(slidesData)

        if (slidesError) throw slidesError
      }

      onSave?.(slideshowData)
    } catch (error) {
      console.error('Error saving slideshow:', error)
    } finally {
      setSaving(false)
    }
  }

  // Show loading until Supabase is ready
  if (!isInitialized || !supabase) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading slideshow builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Toolbar */}
      <SlideToolbar
        slideshowName={formData.name}
        onNameChange={(name) => setFormData(prev => ({ ...prev, name }))}
        onAddTextSlide={handleAddTextSlide}
        onAddImageSlide={handleAddImageSlide}
        onPlaySlideshow={() => setShowPreview(true)}
        onSettings={() => setShowSettings(true)}
        onSave={handleSave}
        onCancel={onCancel}
        saving={saving}
        hasSlides={slides.length > 0}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Slide Thumbnails */}
        <div className="hidden md:flex md:w-60 bg-white border-r border-gray-200 flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Slides</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={slides} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {slides.map((slide, index) => (
                    <SlideThumbnail
                      key={slide.id}
                      slide={slide}
                      index={index}
                      isSelected={selectedSlideIndex === index}
                      onClick={() => handleSlideSelect(index)}
                      onDelete={() => handleSlideDelete(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Add Slide Button */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleAddTextSlide}
              className="w-full"
            >
              + Add Slide
            </Button>
          </div>
        </div>

        {/* Central Editing Area */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            {selectedSlide ? (
              <SlideEditor
                slide={selectedSlide}
                slideIndex={selectedSlideIndex}
                organizationId={organizationId}
                onUpdate={handleSlideUpdate}
                onDurationChange={(duration) => handleSlideDurationChange(selectedSlideIndex, duration)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center text-gray-500 max-w-md">
                  <div className="text-4xl md:text-6xl mb-4">📊</div>
                  <h3 className="text-lg md:text-xl font-medium mb-2">No slides yet</h3>
                  <p className="text-sm md:text-base text-gray-400 mb-6">Add your first slide to get started</p>
                  <div className="space-y-2">
                    <Button onClick={handleAddTextSlide} className="w-full sm:w-auto">
                      Add Text Slide
                    </Button>
                    <Button onClick={handleAddImageSlide} variant="outline" className="w-full sm:w-auto sm:ml-2">
                      Add Image Slide
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Slide Properties (Hidden on mobile) */}
          <div className="hidden lg:block">
            <SlidePropertiesPanel
              slide={selectedSlide}
              slideIndex={selectedSlideIndex}
              onDurationChange={(duration) => handleSlideDurationChange(selectedSlideIndex, duration)}
              onEdit={handlePropertiesPanelEdit}
              isCollapsed={isPropertiesPanelCollapsed}
              onToggleCollapse={() => setIsPropertiesPanelCollapsed(!isPropertiesPanelCollapsed)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Slide Navigation */}
      <div className="md:hidden bg-white border-t border-gray-200 p-3 overflow-x-auto">
        {slides.length > 0 ? (
          <div className="flex gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => handleSlideSelect(index)}
                className={`
                  flex-shrink-0 w-20 h-14 rounded border-2 overflow-hidden transition-colors
                  ${selectedSlideIndex === index 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                  }
                `}
              >
                {slide.content.type === 'image' ? (
                  <img
                    src={slide.content.thumbnail_url || slide.content.file_url!}
                    alt={slide.content.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-[8px] p-1"
                    style={{
                      backgroundColor: slide.content.background_color,
                      color: slide.content.text_color
                    }}
                  >
                    {slide.content.title || slide.content.content_text || 'Text'}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-[10px] text-center py-0.5">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-2">
            <p className="text-sm">No slides yet. Use the toolbar to add slides.</p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SlideshowSettings
          settings={formData}
          onSave={(settings) => {
            setFormData(prev => ({ ...prev, ...settings }))
            setShowSettings(false)
          }}
          onCancel={() => setShowSettings(false)}
        />
      )}

      {/* Preview Modal */}
      {showPreview && slides.length > 0 && (
        <SlideshowPreview
          slides={slides.map(slide => slide.content)}
          settings={formData}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Text Slide Creator Modal */}
      {showTextCreator && (
        <TextSlideCreator
          organizationId={organizationId}
          editContent={selectedSlide?.content.type === 'text' ? selectedSlide.content : undefined}
          onSave={(content) => {
            if (selectedSlide?.content.type === 'text') {
              handleSlideUpdate(content)
            } else {
              handleTextSlideCreated(content)
            }
            setShowTextCreator(false)
          }}
          onCancel={() => setShowTextCreator(false)}
        />
      )}

      {/* Image Slide Creator Modal */}
      {showImageUpload && (
        <ImageSlideCreator
          organizationId={organizationId}
          editContent={selectedSlide?.content.type === 'image' ? selectedSlide.content : undefined}
          onSave={(content) => {
            if (selectedSlide?.content.type === 'image') {
              handleSlideUpdate(content)
            } else {
              handleImageSlideCreated(content)
            }
            setShowImageUpload(false)
          }}
          onCancel={() => setShowImageUpload(false)}
        />
      )}
    </div>
  )
}