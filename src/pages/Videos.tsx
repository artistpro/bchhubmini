import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Search, Filter, Play, Eye, Calendar, Clock, Star } from 'lucide-react'
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
  matched_keywords: string[]
}

export function Videos() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'publish_date' | 'view_count' | 'title'>('publish_date')
  const [filterFeatured, setFilterFeatured] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const videosPerPage = 12

  useEffect(() => {
    fetchVideos()
  }, [searchTerm, sortBy, filterFeatured, currentPage])

  async function fetchVideos() {
    try {
      setLoading(true)
      
      let query = supabase
        .from('videos')
        .select('*', { count: 'exact' })
        .eq('is_approved', true)

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }
      
      if (filterFeatured) {
        query = query.eq('is_featured', true)
      }

      // Apply sorting
      const ascending = sortBy === 'title'
      query = query.order(sortBy, { ascending })

      // Apply pagination
      const from = (currentPage - 1) * videosPerPage
      const to = from + videosPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error
      
      setVideos(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / videosPerPage)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Bitcoin Cash Videos
        </h1>
        <p className="text-lg text-gray-600">
          Curated collection of Bitcoin Cash videos from trusted YouTube channels.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#16a085] focus:border-[#16a085]"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#16a085] focus:border-[#16a085]"
          >
            <option value="publish_date">Latest First</option>
            <option value="view_count">Most Viewed</option>
            <option value="title">Alphabetical</option>
          </select>

          {/* Featured Filter */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterFeatured}
              onChange={(e) => {
                setFilterFeatured(e.target.checked)
                setCurrentPage(1)
              }}
              className="w-4 h-4 text-[#16a085] border-gray-300 rounded focus:ring-[#16a085]"
            />
            <span className="text-sm text-gray-700">Featured Only</span>
          </label>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            {totalCount} video{totalCount !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Videos Grid */}
      {!loading && (
        <>
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No videos found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  variant="default"
                  showWatchButton={false}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages, currentPage - 2 + i))
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? 'bg-[#16a085] hover:bg-[#0e7a6b]' : ''}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}