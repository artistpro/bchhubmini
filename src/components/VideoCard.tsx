import React from 'react'
import { Play, Eye, Calendar, Star, Share2 } from 'lucide-react'
import { formatNumber, formatDate, formatDuration } from '@/lib/utils'
import { useVideoModal } from '@/contexts/VideoModalContext'
import { Button } from '@/components/ui/button'
import { CompactShareButtons } from '@/components/SocialShareButtons'

interface VideoCardProps {
  video: {
    id: string
    video_id: string
    title: string
    description?: string
    thumbnail_url?: string
    publish_date?: string
    duration?: string
    view_count: number
    is_featured: boolean
    matched_keywords?: string[]
  }
  showWatchButton?: boolean
  showShareButton?: boolean
  variant?: 'default' | 'featured' | 'compact'
  className?: string
}

export function VideoCard({ 
  video, 
  showWatchButton = false, 
  showShareButton = true,
  variant = 'default',
  className = ''
}: VideoCardProps) {
  const { openModal } = useVideoModal()

  const handleClick = () => {
    openModal(video.video_id, video.title)
  }

  const handleWatchClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openModal(video.video_id, video.title)
  }

  const videoUrl = `${window.location.origin}/video/${video.video_id}`
  const shareTitle = `${video.title} - BCH Content Hub`
  const shareDescription = video.description || `Watch this Bitcoin Cash video on BCH Content Hub: ${video.title}`

  const baseClasses = "bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
  const featuredClasses = variant === 'featured' ? "shadow-lg hover:shadow-xl border-2 border-yellow-200" : "shadow-md"
  const cardClasses = `${baseClasses} ${featuredClasses} ${className}`

  return (
    <div className={cardClasses} onClick={handleClick}>
      <div className="relative group">
        {variant === 'featured' && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>Featured</span>
            </div>
          </div>
        )}
        
        <img
          src={video.thumbnail_url || '/api/placeholder/400/225'}
          alt={video.title}
          className={variant === 'featured' ? "w-full h-48 object-cover" : "w-full h-48 object-cover"}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="h-12 w-12 text-white" />
        </div>
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}
        {video.is_featured && variant !== 'featured' && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
            <Star className="h-3 w-3" />
            <span>Featured</span>
          </div>
        )}
      </div>
      
      <div className={variant === 'featured' ? "p-6" : "p-4"}>
        {variant === 'featured' && (
          <div className="flex items-center space-x-2 mb-2">
            <Play className="h-4 w-4 text-[#16a085]" />
            <span className="text-sm font-medium text-gray-600">Video</span>
          </div>
        )}
        
        <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${
          variant === 'featured' ? 'text-lg font-bold' : 'text-sm'
        }`}>
          {video.title}
        </h3>
        
        {video.description && (
          <p className={`text-gray-600 mb-3 line-clamp-2 ${
            variant === 'featured' ? 'text-sm mb-4' : 'text-xs'
          }`}>
            {video.description}
          </p>
        )}
        
        <div className={`flex items-center text-xs text-gray-500 ${
          showWatchButton ? 'justify-between' : 'justify-start'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{formatNumber(video.view_count)}</span>
            </div>
            {video.publish_date && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(video.publish_date)}</span>
              </div>
            )}
          </div>
          
          {showWatchButton && (
            <Button
              size="sm" 
              className="bg-[#16a085] hover:bg-[#0e7a6b]"
              onClick={handleWatchClick}
            >
              <Play className="h-4 w-4 mr-1" />
              Watch
            </Button>
          )}
        </div>
        
        {video.matched_keywords && video.matched_keywords.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {video.matched_keywords.slice(0, 2).map((keyword, index) => (
                <span
                  key={index}
                  className="inline-block bg-[#16a085]/10 text-[#16a085] text-xs px-2 py-1 rounded"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Share Buttons */}
        {showShareButton && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Share video:</span>
              <div onClick={(e) => e.stopPropagation()}>
                <CompactShareButtons
                  url={videoUrl}
                  title={shareTitle}
                  description={shareDescription}
                  hashtags={['BitcoinCash', 'BCH']}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}