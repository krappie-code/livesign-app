'use client'

import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { supabase } from '@/lib/supabase'
import { Content, CreateContent } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Palette, Type as TypeIcon } from 'lucide-react'

interface TextSlideCreatorProps {
  organizationId: string
  onSave: (textSlide: Content) => void
  onCancel: () => void
  editContent?: Content
}

export function TextSlideCreator({ 
  organizationId, 
  onSave, 
  onCancel, 
  editContent 
}: TextSlideCreatorProps) {
  const [formData, setFormData] = useState({
    name: editContent?.name || '',
    title: editContent?.title || '',
    content_text: editContent?.content_text || '',
    background_color: editContent?.background_color || '#1a1a1a',
    text_color: editContent?.text_color || '#ffffff',
    font_family: editContent?.font_family || 'Inter',
    font_size: editContent?.font_size || 48
  })
  
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  const fontOptions = [
    'Inter',
    'Arial',
    'Helvetica',
    'Georgia',
    'Times New Roman',
    'Roboto',
    'Open Sans',
    'Montserrat'
  ]

  const fontSizeOptions = [16, 20, 24, 32, 40, 48, 56, 64, 72, 96]

  async function handleSave() {
    if (!formData.name.trim()) return

    setSaving(true)
    try {
      const contentData: CreateContent | Partial<Content> = {
        organization_id: organizationId,
        name: formData.name.trim(),
        type: 'text',
        title: formData.title.trim() || null,
        content_text: formData.content_text.trim() || null,
        background_color: formData.background_color,
        text_color: formData.text_color,
        font_family: formData.font_family,
        font_size: formData.font_size,
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
      console.error('Error saving text slide:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TypeIcon className="h-5 w-5" />
            {editContent ? 'Edit Text Slide' : 'Create Text Slide'}
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
                  placeholder="My Text Slide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title (Optional)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Slide Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={formData.content_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none h-32"
                  placeholder="Enter your text content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium mb-2">Background Color</label>
                  <button
                    onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                    className="w-full h-10 rounded-md border border-gray-300 flex items-center gap-2 px-3"
                  >
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: formData.background_color }}
                    />
                    {formData.background_color}
                  </button>
                  
                  {showBgColorPicker && (
                    <div className="absolute top-full mt-2 z-10">
                      <div className="bg-white p-4 rounded-lg shadow-lg border">
                        <HexColorPicker
                          color={formData.background_color}
                          onChange={(color) => setFormData(prev => ({ ...prev, background_color: color }))}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowBgColorPicker(false)}
                          className="mt-2 w-full"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium mb-2">Text Color</label>
                  <button
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                    className="w-full h-10 rounded-md border border-gray-300 flex items-center gap-2 px-3"
                  >
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: formData.text_color }}
                    />
                    {formData.text_color}
                  </button>
                  
                  {showTextColorPicker && (
                    <div className="absolute top-full mt-2 z-10">
                      <div className="bg-white p-4 rounded-lg shadow-lg border">
                        <HexColorPicker
                          color={formData.text_color}
                          onChange={(color) => setFormData(prev => ({ ...prev, text_color: color }))}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowTextColorPicker(false)}
                          className="mt-2 w-full"
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <select
                    value={formData.font_family}
                    onChange={(e) => setFormData(prev => ({ ...prev, font_family: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {fontOptions.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Font Size</label>
                  <select
                    value={formData.font_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, font_size: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {fontSizeOptions.map(size => (
                      <option key={size} value={size}>{size}px</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <label className="block text-sm font-medium">Preview</label>
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="aspect-video flex items-center justify-center p-8"
                  style={{ 
                    backgroundColor: formData.background_color,
                    color: formData.text_color,
                    fontFamily: formData.font_family
                  }}
                >
                  <div className="text-center">
                    {formData.title && (
                      <h2 
                        className="font-bold mb-4"
                        style={{ fontSize: `${Math.min(formData.font_size * 1.5, 72)}px` }}
                      >
                        {formData.title}
                      </h2>
                    )}
                    {formData.content_text && (
                      <p style={{ fontSize: `${formData.font_size}px` }}>
                        {formData.content_text}
                      </p>
                    )}
                    {!formData.title && !formData.content_text && (
                      <p className="text-gray-400 italic">Preview will appear here</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.name.trim() || saving}
            >
              {saving ? 'Saving...' : editContent ? 'Update Slide' : 'Create Slide'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}