'use client'

import { Content } from '@/types/database'
import { cn } from '@/lib/utils'
import { ImageIcon, Type } from 'lucide-react'

interface ContentPreviewProps {
  content: Content
  className?: string
  showOverlay?: boolean
}

export function ContentPreview({ 
  content, 
  className,
  showOverlay = true 
}: ContentPreviewProps) {
  if (content.type === 'image') {
    return (
      <div className={cn("relative bg-gray-100", className)}>
        {content.file_url ? (
          <>
            <img
              src={content.thumbnail_url || content.file_url}
              alt={content.name}
              className="w-full h-full object-cover"
            />
            {showOverlay && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                  <ImageIcon className="h-4 w-4" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
    )
  }

  if (content.type === 'text') {
    return (
      <div className={cn("relative", className)}>
        <div
          className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
          style={{ 
            backgroundColor: content.background_color,
            color: content.text_color,
            fontFamily: content.font_family
          }}
        >
          <div className="text-center">
            {content.title && (
              <h3 
                className="font-bold mb-2 truncate"
                style={{ fontSize: `${Math.min(content.font_size * 0.8, 24)}px` }}
              >
                {content.title}
              </h3>
            )}
            {content.content_text && (
              <p 
                className="truncate"
                style={{ fontSize: `${Math.min(content.font_size * 0.6, 18)}px` }}
              >
                {content.content_text}
              </p>
            )}
          </div>
        </div>
        
        {showOverlay && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
              <Type className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("bg-gray-100 flex items-center justify-center", className)}>
      <div className="text-gray-400">Unknown content type</div>
    </div>
  )
}