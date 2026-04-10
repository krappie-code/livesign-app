'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Content, CreateContent } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Image as ImageIcon, Type, Trash2, Plus } from 'lucide-react'
import { TextSlideCreator } from './text-slide-creator'
import { ContentPreview } from './content-preview'

interface ContentLibraryProps {
  organizationId: string
  onContentSelect?: (content: Content) => void
  selectedContent?: Content[]
}

export function ContentLibrary({ 
  organizationId, 
  onContentSelect,
  selectedContent = []
}: ContentLibraryProps) {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [showTextCreator, setShowTextCreator] = useState(false)
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: handleFileDrop
  })

  const loadContent = useCallback(async () => {
    if (!supabase) return
    
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setContent(data || [])
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }, [organizationId, supabase])

  useEffect(() => {
    if (isInitialized) {
      loadContent()
    }
  }, [isInitialized, loadContent])

  async function handleFileDrop(acceptedFiles: File[]) {
    for (const file of acceptedFiles) {
      await uploadImage(file)
    }
  }

  async function uploadImage(file: File) {
    if (!supabase) return
    
    const fileId = Math.random().toString(36).substring(7)
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(fileName)

      // Create thumbnail (for now, use the same image)
      const thumbnailUrl = publicUrl

      // Get image dimensions
      const img = new Image()
      img.src = URL.createObjectURL(file)
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      // Save to database
      const newContent: CreateContent = {
        organization_id: organizationId,
        name: file.name.split('.')[0],
        type: 'image',
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type,
        width: img.width,
        height: img.height,
        thumbnail_url: thumbnailUrl,
        created_by: (await supabase.auth.getUser()).data.user!.id
      }

      const { data, error } = await supabase
        .from('content')
        .insert(newContent)
        .select()
        .single()

      if (error) throw error

      setContent(prev => [data, ...prev])
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))
      
      // Remove progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const { [fileId]: _, ...rest } = prev
          return rest
        })
      }, 2000)

    } catch (error) {
      console.error('Error uploading image:', error)
      setUploadProgress(prev => {
        const { [fileId]: _, ...rest } = prev
        return rest
      })
    }
  }

  async function deleteContent(contentId: string) {
    if (!supabase) return
    
    try {
      const contentItem = content.find(c => c.id === contentId)
      if (!contentItem) return

      // Delete from storage if it's an image
      if (contentItem.type === 'image' && contentItem.file_url) {
        const fileName = contentItem.file_url.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('content')
            .remove([fileName])
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId)

      if (error) throw error

      setContent(prev => prev.filter(c => c.id !== contentId))
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  async function handleTextSlideCreated(textSlide: Content) {
    setContent(prev => [textSlide, ...prev])
    setShowTextCreator(false)
  }

  const isSelected = (contentItem: Content) => {
    return selectedContent.some(c => c.id === contentItem.id)
  }

  // Show loading until Supabase is ready
  if (!isInitialized || !supabase) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content library...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Content Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div 
              {...getRootProps()} 
              className={`
                flex-1 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                {isDragActive ? 'Drop images here' : 'Drag & drop images, or click to select'}
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, WebP up to 10MB
              </p>
            </div>

            <Button
              onClick={() => setShowTextCreator(true)}
              variant="outline"
              className="flex flex-col h-32 w-32 p-4"
            >
              <Type className="h-8 w-8 mb-2" />
              <span className="text-xs">Create Text Slide</span>
            </Button>
          </div>

          {/* Upload Progress */}
          {Object.entries(uploadProgress).length > 0 && (
            <div className="space-y-2 mb-4">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{progress}%</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {content.map((item) => (
          <div
            key={item.id}
            className={`
              relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all
              ${isSelected(item) ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}
            `}
            onClick={() => onContentSelect?.(item)}
          >
            <ContentPreview content={item} className="aspect-square" />
            
            {/* Content Info */}
            <div className="p-2 bg-white">
              <p className="text-xs font-medium truncate">{item.name}</p>
              <p className="text-xs text-gray-500 capitalize">{item.type}</p>
            </div>

            {/* Delete Button */}
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                deleteContent(item.id)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>

            {/* Selection Indicator */}
            {isSelected(item) && (
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center">
                <Plus className="h-3 w-3" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Text Slide Creator Modal */}
      {showTextCreator && (
        <TextSlideCreator
          organizationId={organizationId}
          onSave={handleTextSlideCreated}
          onCancel={() => setShowTextCreator(false)}
        />
      )}
    </div>
  )
}