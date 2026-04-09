'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { SlideshowWithSlides, CreateSlideshow } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Play, Edit, Copy, Trash2, Share, Eye, ExternalLink } from 'lucide-react'
import { SlideshowBuilder } from '../slideshow/slideshow-builder'

interface SlideshowDashboardProps {
  organizationId: string
}

export function SlideshowDashboard({ organizationId }: SlideshowDashboardProps) {
  const [slideshows, setSlideshows] = useState<SlideshowWithSlides[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlideshow, setSelectedSlideshow] = useState<SlideshowWithSlides | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const loadSlideshows = useCallback(async () => {
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
              name,
              type,
              file_url,
              thumbnail_url,
              title,
              background_color,
              text_color
            )
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setSlideshows(data || [])
    } catch (error) {
      console.error('Error loading slideshows:', error)
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    loadSlideshows()
  }, [loadSlideshows])

  async function createSlideshow() {
    setSelectedSlideshow(null)
    setShowBuilder(true)
  }

  async function editSlideshow(slideshow: SlideshowWithSlides) {
    setSelectedSlideshow(slideshow)
    setShowBuilder(true)
  }

  async function duplicateSlideshow(slideshow: SlideshowWithSlides) {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) return

      // Create new slideshow
      const newSlideshowData: CreateSlideshow = {
        organization_id: organizationId,
        name: `${slideshow.name} (Copy)`,
        description: slideshow.description,
        default_slide_duration: slideshow.default_slide_duration,
        transition_type: slideshow.transition_type,
        auto_advance: slideshow.auto_advance,
        background_color: slideshow.background_color,
        created_by: user.data.user.id
      }

      const { data: newSlideshow, error } = await supabase
        .from('slideshows')
        .insert(newSlideshowData)
        .select()
        .single()

      if (error) throw error

      // Copy slides if any exist
      if (slideshow.slideshow_slides && slideshow.slideshow_slides.length > 0) {
        const slidesData = slideshow.slideshow_slides.map(slide => ({
          slideshow_id: newSlideshow.id,
          content_id: slide.content.id,
          slide_order: slide.slide_order,
          duration: slide.duration
        }))

        await supabase.from('slideshow_slides').insert(slidesData)
      }

      loadSlideshows()
    } catch (error) {
      console.error('Error duplicating slideshow:', error)
    }
  }

  async function deleteSlideshow(slideshowId: string) {
    if (!confirm('Are you sure you want to delete this slideshow?')) return

    try {
      const { error } = await supabase
        .from('slideshows')
        .delete()
        .eq('id', slideshowId)

      if (error) throw error

      setSlideshows(prev => prev.filter(s => s.id !== slideshowId))
    } catch (error) {
      console.error('Error deleting slideshow:', error)
    }
  }

  async function copyDisplayUrl(slideshowId: string) {
    const url = `${window.location.origin}/display/${slideshowId}`
    
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(slideshowId)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedUrl(slideshowId)
      setTimeout(() => setCopiedUrl(null), 2000)
    }
  }

  function openDisplay(slideshowId: string) {
    const url = `/display/${slideshowId}`
    window.open(url, '_blank')
  }

  if (showBuilder) {
    return (
      <SlideshowBuilder
        organizationId={organizationId}
        slideshow={selectedSlideshow || undefined}
        onSave={() => {
          setShowBuilder(false)
          setSelectedSlideshow(null)
          loadSlideshows()
        }}
        onCancel={() => {
          setShowBuilder(false)
          setSelectedSlideshow(null)
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading slideshows...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Digital Signage</h1>
          <p className="text-gray-600">Manage your slideshows and displays</p>
        </div>
        <Button onClick={createSlideshow} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Slideshow
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Slideshows</p>
                <p className="text-2xl font-bold text-gray-900">{slideshows.length}</p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Displays</p>
                <p className="text-2xl font-bold text-gray-900">
                  {slideshows.filter(s => s.is_active).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {slideshows.reduce((sum, s) => sum + s.view_count, 0)}
                </p>
              </div>
              <Share className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Slides</p>
                <p className="text-2xl font-bold text-gray-900">
                  {slideshows.reduce((sum, s) => sum + (s.slideshow_slides?.length || 0), 0)}
                </p>
              </div>
              <Copy className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slideshows Grid */}
      {slideshows.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Play className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No slideshows yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first digital signage slideshow to get started
              </p>
              <Button onClick={createSlideshow}>
                <Plus className="h-4 w-4 mr-2" />
                Create Slideshow
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slideshows.map((slideshow) => (
            <Card key={slideshow.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{slideshow.name}</CardTitle>
                    {slideshow.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {slideshow.description}
                      </p>
                    )}
                  </div>
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium ml-2
                    ${slideshow.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {slideshow.is_active ? 'Active' : 'Draft'}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Slideshow Preview */}
                <div className="mb-4">
                  {slideshow.slideshow_slides && slideshow.slideshow_slides.length > 0 ? (
                    <div className="grid grid-cols-4 gap-1 h-16">
                      {slideshow.slideshow_slides.slice(0, 4).map((slide, index) => (
                        <div
                          key={slide.id}
                          className="bg-gray-100 rounded overflow-hidden border"
                        >
                          {slide.content.type === 'image' ? (
                            <img
                              src={slide.content.thumbnail_url || slide.content.file_url!}
                              alt={slide.content.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-xs"
                              style={{
                                backgroundColor: slide.content.background_color,
                                color: slide.content.text_color
                              }}
                            >
                              <div className="truncate px-1">
                                {slide.content.title || slide.content.content_text || 'Text'}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-16 bg-gray-100 rounded border-2 border-dashed flex items-center justify-center">
                      <span className="text-gray-500 text-sm">No slides</span>
                    </div>
                  )}
                </div>

                {/* Slideshow Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{slideshow.slideshow_slides?.length || 0} slides</span>
                  <span>{slideshow.view_count} views</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDisplay(slideshow.id)}
                    className="flex-1"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Display
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyDisplayUrl(slideshow.id)}
                    className={`px-3 ${copiedUrl === slideshow.id ? 'bg-green-50 text-green-700' : ''}`}
                  >
                    {copiedUrl === slideshow.id ? 'Copied!' : <Share className="h-3 w-3" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editSlideshow(slideshow)}
                    className="px-3"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => duplicateSlideshow(slideshow)}
                    className="px-3"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteSlideshow(slideshow.id)}
                    className="px-3"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}