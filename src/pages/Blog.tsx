import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Search, Calendar, User, Eye, Tag, ArrowRight } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image_url?: string
  published_at?: string
  view_count: number
  tags: string[]
  is_featured: boolean
}

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [sortBy, setSortBy] = useState<'published_at' | 'view_count' | 'title'>('published_at')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [allTags, setAllTags] = useState<string[]>([])
  const postsPerPage = 9

  useEffect(() => {
    fetchPosts()
    fetchTags()
  }, [searchTerm, selectedTag, sortBy, currentPage])

  async function fetchPosts() {
    try {
      setLoading(true)
      
      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published')

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
      }
      
      if (selectedTag) {
        query = query.contains('tags', [selectedTag])
      }

      // Apply sorting
      const ascending = sortBy === 'title'
      query = query.order(sortBy, { ascending })

      // Apply pagination
      const from = (currentPage - 1) * postsPerPage
      const to = from + postsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error
      
      setPosts(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchTags() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('tags')
        .eq('status', 'published')

      if (error) throw error

      const tagSet = new Set<string>()
      data?.forEach(post => {
        post.tags?.forEach((tag: string) => tagSet.add(tag))
      })
      
      setAllTags(Array.from(tagSet).sort())
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const totalPages = Math.ceil(totalCount / postsPerPage)
  const featuredPosts = posts.filter(post => post.is_featured).slice(0, 3)
  const regularPosts = posts.filter(post => !post.is_featured)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Bitcoin Cash Blog
        </h1>
        <p className="text-lg text-gray-600">
          In-depth analysis, news, and educational content about Bitcoin Cash.
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
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#16a085] focus:border-[#16a085]"
            />
          </div>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => {
              setSelectedTag(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#16a085] focus:border-[#16a085]"
          >
            <option value="">All Categories</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#16a085] focus:border-[#16a085]"
          >
            <option value="published_at">Latest First</option>
            <option value="view_count">Most Read</option>
            <option value="title">Alphabetical</option>
          </select>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            {totalCount} article{totalCount !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Blog Posts */}
      {!loading && (
        <>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No articles found matching your criteria.</p>
            </div>
          ) : (
            <>
              {/* Featured Posts */}
              {featuredPosts.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredPosts.map((post) => (
                      <FeaturedPostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Posts */}
              {regularPosts.length > 0 && (
                <div className="mb-8">
                  {featuredPosts.length > 0 && (
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">All Articles</h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {regularPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </>
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

function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-yellow-200">
      <div className="relative h-48 bg-gray-200">
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
        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
          Featured
        </div>
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            {post.published_at && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Eye className="h-4 w-4 mr-1" />
            <span>{formatNumber(post.view_count)} views</span>
          </div>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-[#16a085]/10 text-[#16a085] text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <Link 
          to={`/blog/${post.slug}`}
          className="inline-flex items-center text-[#16a085] hover:text-[#0e7a6b] font-medium"
        >
          Read Full Article
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200">
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
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          <Link to={`/blog/${post.slug}`} className="hover:text-[#16a085] transition-colors">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            {post.published_at && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Eye className="h-4 w-4 mr-1" />
            <span>{formatNumber(post.view_count)}</span>
          </div>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-[#16a085]/10 text-[#16a085] text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <Link 
          to={`/blog/${post.slug}`}
          className="inline-flex items-center text-[#16a085] hover:text-[#0e7a6b] text-sm font-medium"
        >
          Read More
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}