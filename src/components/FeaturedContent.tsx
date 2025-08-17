import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Play, FileText, Star, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useVideoModal } from '@/contexts/VideoModalContext'
import { VideoCard } from '@/components/VideoCard'

interface FeaturedVideo {
  id: string
  video_id: string
  title: string
  description?: string
  thumbnail_url?: string
  publish_date?: string
  view_count: number
  is_featured: boolean
}

interface FeaturedBlogPost {
  id: string
  title: string
  excerpt?: string
  featured_image_url?: string
  slug: string
  published_at?: string
  is_featured: boolean
}

export function FeaturedContent() {
  const [featuredVideos, setFeaturedVideos] = useState<FeaturedVideo[]>([])
  const [featuredBlogPosts, setFeaturedBlogPosts] = useState<FeaturedBlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { openModal } = useVideoModal()

  useEffect(() => {
    fetchFeaturedContent()
  }, [])

  async function fetchFeaturedContent() {
    try {
      setLoading(true)
      
      // Get featured videos directly from videos table
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('is_featured', true)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(4)

      if (videosError) {
        console.error('Error fetching featured videos:', videosError)
        throw videosError
      }

      // Get featured blog posts
      const { data: blogData, error: blogError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_featured', true)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(2)

      if (blogError) {
        console.error('Error fetching featured blog posts:', blogError)
        // Don't throw here - blog posts might not have is_featured column yet
      }

      setFeaturedVideos(videosData || [])
      setFeaturedBlogPosts(blogData || [])
    } catch (error) {
      console.error('Error fetching featured content:', error)
      setError('Failed to load featured content')
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

  // Combine and limit total items
  const totalItems = featuredVideos.length + featuredBlogPosts.length
  
  if (totalItems === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No featured content available yet.</p>
        <p className="text-sm text-gray-500 mt-2">Admins can mark videos and blog posts as featured to display them here.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Featured Videos */}
      {featuredVideos.map((video) => (
        <VideoCard 
          key={`video-${video.id}`}
          video={video}
          variant="featured"
          showWatchButton={true}
        />
      ))}      
      {/* Featured Blog Posts */}
      {featuredBlogPosts.map((post) => (
        <div key={`post-${post.id}`} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-yellow-200">
          <div className="relative">
            <div className="absolute top-2 left-2 z-10">
              <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>Featured</span>
              </div>
            </div>
            
            <div className="h-48 bg-gray-200">
              {post.featured_image_url ? (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#16a085] to-[#f39c12] flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">BCH</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-[#f39c12]" />
              <span className="text-sm font-medium text-gray-600">Article</span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {post.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {post.excerpt || 'No excerpt available'}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(post.published_at)}</span>
              </div>
              
              <Link to={`/blog/${post.slug}`}>
                <Button size="sm" variant="outline" className="border-[#f39c12] text-[#f39c12] hover:bg-[#f39c12] hover:text-white">
                  <FileText className="h-4 w-4 mr-1" />
                  Read
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}