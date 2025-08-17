import React, { useEffect, useState } from 'react'
import { X, Share2 } from 'lucide-react'
import { useVideoModal } from '@/contexts/VideoModalContext'
import { Button } from '@/components/ui/button'
import ShareModal from '@/components/ShareModal'

export function VideoModal() {
  const { isOpen, videoId, videoTitle, closeModal } = useVideoModal()
  const [showShareModal, setShowShareModal] = useState(false)

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, closeModal])

  // Prevent modal content clicks from closing modal
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  if (!isOpen || !videoId) {
    return null
  }

  const videoUrl = `${window.location.origin}/video/${videoId}`

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div 
        className="relative w-full max-w-4xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden"
        onClick={handleModalContentClick}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
            {videoTitle || 'Video Player'}
          </h3>
          <button
            onClick={closeModal}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Close video"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        {/* Video container with 16:9 aspect ratio */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={videoTitle || 'YouTube video player'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        
        {/* Additional controls/info can be added here */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>Playing on BCH Content Hub</span>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareModal(true)}
                className="text-[#16a085] hover:text-[#0e7a6b] font-medium"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <a 
                href={`https://youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#16a085] hover:text-[#0e7a6b] font-medium"
              >
                View on YouTube
              </a>
            </div>
          </div>

        </div>
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        videoUrl={videoUrl}
        title={videoTitle || 'Video'}
      />
    </div>
  )
}