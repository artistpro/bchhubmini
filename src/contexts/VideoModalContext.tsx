import React, { createContext, useContext, useState, ReactNode } from 'react'

interface VideoModalContextType {
  isOpen: boolean
  videoId: string | null
  videoTitle: string | null
  openModal: (videoId: string, videoTitle?: string) => void
  closeModal: () => void
}

const VideoModalContext = createContext<VideoModalContextType | undefined>(undefined)

export function VideoModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoTitle, setVideoTitle] = useState<string | null>(null)

  const openModal = (id: string, title?: string) => {
    setVideoId(id)
    setVideoTitle(title || null)
    setIsOpen(true)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setIsOpen(false)
    setVideoId(null)
    setVideoTitle(null)
    // Restore body scroll
    document.body.style.overflow = 'unset'
  }

  return (
    <VideoModalContext.Provider value={{
      isOpen,
      videoId,
      videoTitle,
      openModal,
      closeModal
    }}>
      {children}
    </VideoModalContext.Provider>
  )
}

export function useVideoModal() {
  const context = useContext(VideoModalContext)
  if (context === undefined) {
    throw new Error('useVideoModal must be used within a VideoModalProvider')
  }
  return context
}