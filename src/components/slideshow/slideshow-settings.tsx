'use client'

import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Settings } from 'lucide-react'

interface SlideshowSettingsProps {
  settings: {
    default_slide_duration: number
    transition_type: 'fade' | 'slide' | 'none'
    auto_advance: boolean
    background_color: string
  }
  onSave: (settings: any) => void
  onCancel: () => void
}

export function SlideshowSettings({ settings, onSave, onCancel }: SlideshowSettingsProps) {
  const [formData, setFormData] = useState(settings)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const durationOptions = [
    { value: 5, label: '5 seconds' },
    { value: 10, label: '10 seconds' },
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' }
  ]

  const transitionOptions = [
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'none', label: 'None' }
  ]

  function handleSave() {
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Slideshow Settings
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Default Slide Duration */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Default Slide Duration
            </label>
            <select
              value={formData.default_slide_duration}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                default_slide_duration: parseInt(e.target.value) 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {durationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              How long each slide shows by default (can be overridden per slide)
            </p>
          </div>

          {/* Transition Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Transition Effect
            </label>
            <select
              value={formData.transition_type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                transition_type: e.target.value as 'fade' | 'slide' | 'none'
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {transitionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Animation between slides
            </p>
          </div>

          {/* Auto Advance */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.auto_advance}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  auto_advance: e.target.checked 
                }))}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <div>
                <div className="text-sm font-medium">Auto-advance slides</div>
                <div className="text-xs text-gray-500">
                  Automatically move to the next slide after the duration
                </div>
              </div>
            </label>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Background Color
            </label>
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-full h-12 rounded-md border border-gray-300 flex items-center gap-3 px-3 hover:border-gray-400 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded border-2 border-white shadow-sm"
                  style={{ backgroundColor: formData.background_color }}
                />
                <span className="font-mono text-sm">{formData.background_color}</span>
              </button>
              
              {showColorPicker && (
                <div className="absolute top-full mt-2 z-10">
                  <div className="bg-white p-4 rounded-lg shadow-lg border">
                    <HexColorPicker
                      color={formData.background_color}
                      onChange={(color) => setFormData(prev => ({ 
                        ...prev, 
                        background_color: color 
                      }))}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowColorPicker(false)}
                      className="mt-3 w-full"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Background color for the slideshow display
            </p>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Preview
            </label>
            <div
              className="w-full h-32 rounded-lg border-2 flex items-center justify-center"
              style={{ backgroundColor: formData.background_color }}
            >
              <div className="text-center">
                <div 
                  className="text-lg font-semibold mb-1"
                  style={{ 
                    color: formData.background_color === '#000000' || 
                           formData.background_color === '#ffffff' ? 
                           (formData.background_color === '#000000' ? '#ffffff' : '#000000') : 
                           '#333333'
                  }}
                >
                  Sample Slide
                </div>
                <div 
                  className="text-sm opacity-75"
                  style={{ 
                    color: formData.background_color === '#000000' || 
                           formData.background_color === '#ffffff' ? 
                           (formData.background_color === '#000000' ? '#ffffff' : '#000000') : 
                           '#666666'
                  }}
                >
                  Duration: {formData.default_slide_duration}s • Transition: {formData.transition_type}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}