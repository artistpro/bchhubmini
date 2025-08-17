import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Calendar, User, Eye, Tag, ArrowLeft, Share2 } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image_url?: string
  published_at?: string
  view_count: number
  tags: string[]
  seo_title?: string
  seo_description?: string
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  async function fetchPost() {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()

      if (error) throw error
      
      if (!data) {
        setError('Article not found')
        return
      }

      setPost(data)
      
      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ view_count: data.view_count + 1 })
        .eq('id', data.id)
        
      // Track analytics
      await supabase.functions.invoke('analytics-tracker', {
        body: {
          contentType: 'blog_post',
          contentId: data.id,
          pagePath: `/blog/${slug}`,
          eventType: 'view',
          sessionId: generateSessionId()
        }
      })
        
    } catch (error) {
      console.error('Error fetching blog post:', error)
      setError('Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  const generateSessionId = () => {
    return Math.random().toString(36).substr(2, 9)
  }

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {error || 'Article Not Found'}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blog">
            <Button className="bg-[#16a085] hover:bg-[#0e7a6b]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* SEO Meta Tags */}
      {post.seo_title && (
        <title>{post.seo_title}</title>
      )}
      {post.seo_description && (
        <meta name="description" content={post.seo_description} />
      )}
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            to="/blog"
            className="inline-flex items-center text-[#16a085] hover:text-[#0e7a6b] font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-6">
              {post.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
            {post.published_at && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{formatNumber(post.view_count)} views</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="p-0 h-auto text-gray-500 hover:text-[#16a085]"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#16a085]/10 text-[#16a085]"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="mb-8">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <div 
          className="prose prose-lg prose-gray max-w-none blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Published on {post.published_at && formatDate(post.published_at)}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-[#16a085] text-[#16a085] hover:bg-[#16a085] hover:text-white"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Article
              </Button>
              
              <Link to="/blog">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  More Articles
                </Button>
              </Link>
            </div>
          </div>
        </footer>
      </article>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-[#16a085] to-[#f39c12] py-16 mt-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated with Bitcoin Cash News
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Don't miss out on the latest Bitcoin Cash developments, analysis, and educational content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/videos">
              <Button size="lg" className="bg-white text-[#16a085] hover:bg-gray-100">
                Watch BCH Videos
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#16a085]">
                Get In Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}