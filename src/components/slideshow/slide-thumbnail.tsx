'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Content } from '@/types/database'

interface SlideItem {
  id: string
  content: Content
  duration: number
  order: number
}

interface SlideThumbnailProps {
  slide: SlideItem
  index: number
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
}

export function SlideThumbnail({ 
  slide, 
  index, 
  isSelected, 
  onClick, 
  onDelete 
}: SlideThumbnailProps) {
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this slide?')) {
      onDelete()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
      `}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="bg-white/80 backdrop-blur-sm p-1 rounded">
          <GripVertical className="h-3 w-3 text-gray-600" />
        </div>
      </div>

      {/* Delete Button */}
      <Button
        size="sm"
        variant="destructive"
        className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        onClick={handleDeleteClick}
      >
        <Trash2 className="h-3 w-3" />
      </Button>

      {/* Slide Number */}
      <div className="absolute bottom-1 left-1 bg-gray-900/80 text-white text-xs px-1.5 py-0.5 rounded">
        {index + 1}
      </div>

      {/* Duration Badge */}
      <div className="absolute bottom-1 right-1 bg-gray-900/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
        <Clock className="h-2.5 w-2.5" />
        {slide.duration}s
      </div>

      {/* Slide Content Preview */}
      <div className="aspect-[16/10] w-full">
        {slide.content.type === 'image' ? (
          <img
            src={slide.content.thumbnail_url || slide.content.file_url!}
            alt={slide.content.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
            style={{
              backgroundColor: slide.content.background_color,
              color: slide.content.text_color,
              fontFamily: slide.content.font_family
            }}
          >
            {slide.content.title && (
              <div 
                className="font-bold mb-1 text-[8px] leading-tight truncate w-full"
                style={{ fontSize: Math.max(8, (slide.content.font_size || 48) / 8) }}
              >
                {slide.content.title}
              </div>
            )}
            {slide.content.content_text && (
              <div 
                className="text-[6px] leading-tight line-clamp-3"
                style={{ fontSize: Math.max(6, (slide.content.font_size || 48) / 10) }}
              >
                {slide.content.content_text}
              </div>
            )}
            {!slide.content.title && !slide.content.content_text && (
              <div className="text-[8px] text-gray-400">Text Slide</div>
            )}
          </div>
        )}
      </div>

      {/* Slide Name */}
      <div className="p-1 bg-white border-t border-gray-100">
        <div className="text-xs font-medium text-gray-900 truncate">
          {slide.content.name || `Slide ${index + 1}`}
        </div>
      </div>
    </div>
  )
}