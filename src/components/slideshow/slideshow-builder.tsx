'use client'

import { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Content, Slideshow, SlideshowSlide, CreateSlideshow, CreateSlideshowSlide, SlideshowWithSlides } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Save, Settings, GripVertical, Trash2, Plus, Eye } from 'lucide-react'
import { ContentLibrary } from '../content/content-library'
import { ContentPreview } from '../content/content-preview'
import { SlideshowPreview } from './slideshow-preview'
import { SlideshowSettings } from './slideshow-settings'

interface SlideshowBuilderProps {
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

function SortableSlide({ slide, onDurationChange, onRemove }: {
  slide: SlideItem
  onDurationChange: (duration: number) => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: slide.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const durationOptions = [
    { value: 5, label: '5s' },
    { value: 10, label: '10s' },
    { value: 30, label: '30s' },
    { value: 60, label: '1m' },
    { value: 300, label: '5m' }
  ]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg p-4 shadow-sm"
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Slide Number */}
        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
          {slide.order}
        </div>

        {/* Content Preview */}
        <div className="flex-shrink-0 w-16 h-12 rounded overflow-hidden border">
          <ContentPreview content={slide.content} showOverlay={false} />
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{slide.content.name}</p>
          <p className="text-sm text-gray-500 capitalize">{slide.content.type} slide</p>
        </div>

        {/* Duration Selector */}
        <select
          value={slide.duration}
          onChange={(e) => onDurationChange(parseInt(e.target.value))}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {durationOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Remove Button */}
        <Button
          size="sm"
          variant="destructive"
          onClick={onRemove}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function SlideshowBuilder({ 
  organizationId, 
  slideshow,
  onSave,
  onCancel 
}: SlideshowBuilderProps) {
  const [formData, setFormData] = useState({
    name: slideshow?.name || '',
    description: slideshow?.description || '',
    default_slide_duration: slideshow?.default_slide_duration || 10,
    transition_type: slideshow?.transition_type || 'fade' as 'fade' | 'slide' | 'none',
    auto_advance: slideshow?.auto_advance ?? true,
    background_color: slideshow?.background_color || '#000000'
  })

  const [slides, setSlides] = useState<SlideItem[]>([])
  const [selectedContent, setSelectedContent] = useState<Content[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
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
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  function handleDragEnd(event: any) {
    const { active, over } = event

    if (active.id !== over.id) {
      setSlides((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Update order numbers
        return newItems.map((item, index) => ({
          ...item,
          order: index + 1
        }))
      })
    }
  }

  function handleContentSelect(content: Content) {
    if (selectedContent.some(c => c.id === content.id)) {
      setSelectedContent(prev => prev.filter(c => c.id !== content.id))
    } else {
      setSelectedContent(prev => [...prev, content])
    }
  }

  function addSelectedContent() {
    const newSlides = selectedContent.map((content, index) => ({
      id: `new-${Date.now()}-${index}`,
      content,
      duration: formData.default_slide_duration,
      order: slides.length + index + 1
    }))

    setSlides(prev => [...prev, ...newSlides])
    setSelectedContent([])
  }

  function updateSlideDuration(slideId: string, duration: number) {
    setSlides(prev => prev.map(slide => 
      slide.id === slideId ? { ...slide, duration } : slide
    ))
  }

  function removeSlide(slideId: string) {
    setSlides(prev => {
      const filtered = prev.filter(slide => slide.id !== slideId)
      // Reorder remaining slides
      return filtered.map((slide, index) => ({
        ...slide,
        order: index + 1
      }))
    })
  }

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
          <p className="text-gray-800">Loading slideshow builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {slideshow ? 'Edit Slideshow' : 'Create Slideshow'}
          </h1>
          <p className="text-gray-800">
            Build your digital signage slideshow by adding content and arranging slides
          </p>
        </div>
        
        <div className="flex gap-2">
          {slides.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Content Library */}
        <div className="lg:col-span-2">
          <ContentLibrary
            organizationId={organizationId}
            onContentSelect={handleContentSelect}
            selectedContent={selectedContent}
          />
          
          {selectedContent.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">
                    {selectedContent.length} item{selectedContent.length !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm text-blue-600">
                    Click &quot;Add to Slideshow&quot; to include in your presentation
                  </p>
                </div>
                <Button onClick={addSelectedContent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Slideshow
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Slideshow Builder */}
        <div className="space-y-4">
          {/* Slideshow Info */}
          <Card>
            <CardHeader>
              <CardTitle>Slideshow Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="My Slideshow"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none h-20"
                  placeholder="Slideshow description..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Slides List */}
          <Card>
            <CardHeader>
              <CardTitle>Slides ({slides.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {slides.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Play className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No slides added yet</p>
                  <p className="text-sm">Select content from the library to get started</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={slides} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {slides.map((slide) => (
                        <SortableSlide
                          key={slide.id}
                          slide={slide}
                          onDurationChange={(duration) => updateSlideDuration(slide.id, duration)}
                          onRemove={() => removeSlide(slide.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              disabled={!formData.name.trim() || saving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : slideshow ? 'Update' : 'Create'} Slideshow
            </Button>
          </div>
        </div>
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
    </div>
  )
}