import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Play, Eye, Calendar, Clock } from 'lucide-react'
import { formatNumber, formatDate, formatDuration } from '@/lib/utils'
import { useVideoModal } from '@/contexts/VideoModalContext'
import { VideoCard } from '@/components/VideoCard'

interface Video {
  id: string
  video_id: string
  title: string
  description?: string
  thumbnail_url?: string
  publish_date?: string
  duration?: string
  view_count: number
  is_featured: boolean
}

interface LatestVideosProps {
  limit?: number
}

export function LatestVideos({ limit = 6 }: LatestVideosProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLatestVideos()
  }, [])

  async function fetchLatestVideos() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('is_approved', true)
        .order('publish_date', { ascending: false })
        .limit(limit)

      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
      setError('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No videos available yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          variant="default"
          showWatchButton={false}
        />
      ))}
    </div>
  )
}