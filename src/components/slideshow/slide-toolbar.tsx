'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Save, 
  Settings, 
  Type, 
  Image as ImageIcon,
  ArrowLeft,
  ChevronDown
} from 'lucide-react'

interface SlideToolbarProps {
  slideshowName: string
  onNameChange: (name: string) => void
  onAddTextSlide: () => void
  onAddImageSlide: () => void
  onPlaySlideshow: () => void
  onSettings: () => void
  onSave: () => void
  onCancel?: () => void
  saving: boolean
  hasSlides: boolean
}

export function SlideToolbar({
  slideshowName,
  onNameChange,
  onAddTextSlide,
  onAddImageSlide,
  onPlaySlideshow,
  onSettings,
  onSave,
  onCancel,
  saving,
  hasSlides
}: SlideToolbarProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(slideshowName)
  const [showAddDropdown, setShowAddDropdown] = useState(false)

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      onNameChange(tempName.trim())
      setIsEditingName(false)
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit()
    } else if (e.key === 'Escape') {
      setTempName(slideshowName)
      setIsEditingName(false)
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-3 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
        {/* Back Button */}
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        )}

        {/* Slideshow Name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
              className="text-sm md:text-lg font-medium bg-transparent border-b border-blue-500 focus:outline-none min-w-0 w-full"
              autoFocus
            />
          ) : (
            <h1 
              className="text-sm md:text-lg font-medium cursor-pointer hover:text-blue-600 transition-colors truncate"
              onClick={() => {
                setTempName(slideshowName)
                setIsEditingName(true)
              }}
            >
              {slideshowName}
            </h1>
          )}
        </div>
      </div>

      {/* Center Section - Actions (Hidden on very small screens) */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Add Slide Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            className="flex items-center gap-2"
          >
            <Type className="h-4 w-4" />
            Add Slide
            <ChevronDown className="h-3 w-3" />
          </Button>

          {showAddDropdown && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[160px]">
              <button
                onClick={() => {
                  onAddTextSlide()
                  setShowAddDropdown(false)
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <Type className="h-4 w-4 text-green-600" />
                Text Slide
              </button>
              <button
                onClick={() => {
                  onAddImageSlide()
                  setShowAddDropdown(false)
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <ImageIcon className="h-4 w-4 text-blue-600" />
                Image Slide
              </button>
            </div>
          )}

          {/* Backdrop to close dropdown */}
          {showAddDropdown && (
            <div 
              className="fixed inset-0 z-0" 
              onClick={() => setShowAddDropdown(false)} 
            />
          )}
        </div>

        {/* Quick Add Buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddTextSlide}
          className="flex items-center gap-2"
        >
          <Type className="h-4 w-4" />
          Text
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onAddImageSlide}
          className="flex items-center gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          Image
        </Button>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-300 mx-1" />

        {/* Play Slideshow */}
        <Button
          onClick={onPlaySlideshow}
          disabled={!hasSlides}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          <span className="hidden xl:inline">Play Slideshow</span>
        </Button>

        {/* Settings */}
        <Button
          variant="outline"
          onClick={onSettings}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden xl:inline">Settings</span>
        </Button>
      </div>

      {/* Mobile Action Buttons */}
      <div className="flex lg:hidden items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddTextSlide}
          className="p-2"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddImageSlide}
          className="p-2"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        {hasSlides && (
          <Button
            onClick={onPlaySlideshow}
            size="sm"
            className="p-2"
          >
            <Play className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Right Section - Save Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <Button
          onClick={onSave}
          disabled={saving || !slideshowName.trim()}
          size="sm"
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
        </Button>
      </div>
    </div>
  )
}