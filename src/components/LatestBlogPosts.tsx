import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image_url?: string
  published_at?: string
  view_count: number
}

interface LatestBlogPostsProps {
  limit?: number
}

export function LatestBlogPosts({ limit = 3 }: LatestBlogPostsProps) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLatestPosts()
  }, [])

  async function fetchLatestPosts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image_url, published_at, view_count')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      setError('Failed to load blog posts')
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

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No blog posts available yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-48 bg-gray-200">
            {post.featured_image_url ? (
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#16a085] to-[#f39c12] flex items-center justify-center">
                <span className="text-white text-lg font-semibold">BCH</span>
              </div>
            )}
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              <Link to={`/blog/${post.slug}`} className="hover:text-[#16a085] transition-colors">
                {post.title}
              </Link>
            </h3>
            {post.excerpt && (
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                {post.published_at && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                )}
              </div>
              <Link 
                to={`/blog/${post.slug}`}
                className="inline-flex items-center text-[#16a085] hover:text-[#0e7a6b] text-sm font-medium"
              >
                Read More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}