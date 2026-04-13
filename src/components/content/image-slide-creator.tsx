'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Content, CreateContent } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react'

interface ImageSlideCreatorProps {
  organizationId: string
  onSave: (imageSlide: Content) => void
  onCancel: () => void
  editContent?: Content
}

export function ImageSlideCreator({ 
  organizationId, 
  onSave, 
  onCancel, 
  editContent 
}: ImageSlideCreatorProps) {
  const [formData, setFormData] = useState({
    name: editContent?.name || '',
    file: null as File | null,
    fileUrl: editContent?.file_url || null,
    uploading: false,
    error: null as string | null
  })
  
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        file,
        name: prev.name || file.name.replace(/\.[^/.]+$/, ""),
        error: null
      }))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    disabled: formData.uploading
  })

  async function uploadImage(file: File): Promise<string> {
    if (!supabase) throw new Error('Supabase not initialized')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
    const filePath = `${organizationId}/images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('content')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('content')
      .getPublicUrl(filePath)

    return publicUrl
  }

  async function handleSave() {
    if (!supabase || !formData.name.trim()) return

    // If editing existing image and no new file selected
    if (editContent && !formData.file) {
      const contentData = {
        name: formData.name.trim()
      }

      setSaving(true)
      try {
        const { data, error } = await supabase
          .from('content')
          .update(contentData)
          .eq('id', editContent.id)
          .select()
          .single()
        
        if (error) throw error
        onSave(data)
      } catch (error) {
        console.error('Error updating image slide:', error)
        setFormData(prev => ({ ...prev, error: 'Failed to update image slide' }))
      } finally {
        setSaving(false)
      }
      return
    }

    if (!formData.file && !editContent) {
      setFormData(prev => ({ ...prev, error: 'Please select an image file' }))
      return
    }

    setSaving(true)
    setFormData(prev => ({ ...prev, uploading: true, error: null }))

    try {
      let fileUrl = editContent?.file_url || null
      let fileSize = editContent?.file_size || null
      let width = editContent?.width || null
      let height = editContent?.height || null

      // Upload new file if selected
      if (formData.file) {
        fileUrl = await uploadImage(formData.file)
        fileSize = formData.file.size
        
        // Get image dimensions
        const img = new Image()
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = URL.createObjectURL(formData.file!)
        })
        width = img.naturalWidth
        height = img.naturalHeight
      }

      const contentData: CreateContent | Partial<Content> = {
        organization_id: organizationId,
        name: formData.name.trim(),
        type: 'image',
        file_url: fileUrl,
        file_size: fileSize,
        file_type: formData.file?.type || editContent?.file_type || null,
        width,
        height,
        background_color: '#000000',
        text_color: '#ffffff',
        font_family: 'Inter',
        font_size: 16,
        ...(editContent ? {} : { created_by: (await supabase.auth.getUser()).data.user!.id })
      }

      let result
      if (editContent) {
        // Update existing content
        const { data, error } = await supabase
          .from('content')
          .update(contentData)
          .eq('id', editContent.id)
          .select()
          .single()
        
        if (error) throw error
        result = data
      } else {
        // Create new content
        const { data, error } = await supabase
          .from('content')
          .insert(contentData as CreateContent)
          .select()
          .single()

        if (error) throw error
        result = data
      }

      onSave(result)
    } catch (error) {
      console.error('Error saving image slide:', error)
      setFormData(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to save image slide' 
      }))
    } finally {
      setSaving(false)
      setFormData(prev => ({ ...prev, uploading: false }))
    }
  }

  // Show loading until Supabase is ready
  if (!isInitialized || !supabase) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    )
  }

  const previewUrl = formData.file 
    ? URL.createObjectURL(formData.file)
    : formData.fileUrl

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {editContent ? 'Edit Image Slide' : 'Create Image Slide'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Slide Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="My Image Slide"
                />
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
                    ${formData.uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
                  `}
                >
                  <input {...getInputProps()} />
                  
                  {previewUrl ? (
                    <div className="space-y-3">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded"
                      />
                      {!editContent && (
                        <p className="text-sm text-gray-600">
                          Drop a new image here or click to replace
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      {isDragActive ? (
                        <p className="text-blue-600">Drop the image here...</p>
                      ) : (
                        <div>
                          <p className="text-gray-600 mb-2">
                            Drag & drop an image here, or click to select
                          </p>
                          <p className="text-sm text-gray-500">
                            Supports: JPEG, PNG, GIF, WebP
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Status */}
              {formData.uploading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Uploading image...</span>
                </div>
              )}

              {/* Error Message */}
              {formData.error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{formData.error}</span>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <label className="block text-sm font-medium">Preview</label>
              <div className="border rounded-lg overflow-hidden bg-gray-100">
                <div className="aspect-video flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={formData.name || 'Image slide'}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <ImageIcon className="h-16 w-16 mx-auto mb-2" />
                      <p>Image preview will appear here</p>
                    </div>
                  )}
                </div>
              </div>
              
              {formData.file && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>File size: {Math.round(formData.file.size / 1024)} KB</p>
                  <p>Type: {formData.file.type}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onCancel} disabled={formData.uploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.name.trim() || (!formData.file && !editContent) || saving || formData.uploading}
            >
              {saving ? 'Saving...' : editContent ? 'Update Slide' : 'Create Slide'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}