import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  StarOff,
  Search,
  Calendar,
  FileText,
  Save,
  X
} from 'lucide-react'
import { formatDate, formatNumber, slugify } from '@/lib/utils'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image_url?: string
  author_id: string
  status: 'draft' | 'published' | 'archived'
  view_count: number
  is_featured: boolean
  tags: string[]
  seo_title?: string
  seo_description?: string
  published_at?: string
  created_at: string
  updated_at: string
}

interface BlogFormData {
  title: string
  content: string
  excerpt: string
  featured_image_url: string
  tags: string
  seo_title: string
  seo_description: string
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
}

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'featured'>('all')
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    tags: '',
    seo_title: '',
    seo_description: '',
    status: 'draft',
    is_featured: false
  })

  useEffect(() => {
    fetchPosts()
  }, [searchTerm, filterStatus])

  async function fetchPosts() {
    try {
      setLoading(true)
      
      let query = supabase
        .from('blog_posts')
        .select('*')

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
      }
      
      if (filterStatus === 'draft') {
        query = query.eq('status', 'draft')
      } else if (filterStatus === 'published') {
        query = query.eq('status', 'published')
      } else if (filterStatus === 'featured') {
        query = query.eq('is_featured', true)
      }

      query = query.order('updated_at', { ascending: false })

      const { data, error } = await query
      if (error) throw error
      
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      featured_image_url: '',
      tags: '',
      seo_title: '',
      seo_description: '',
      status: 'draft',
      is_featured: false
    })
    setEditingPost(null)
    setShowForm(false)
  }

  function handleEdit(post: BlogPost) {
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      featured_image_url: post.featured_image_url || '',
      tags: post.tags.join(', '),
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      status: post.status,
      is_featured: post.is_featured
    })
    setEditingPost(post)
    setShowForm(true)
  }

  async function handleSave() {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Title and content are required')
      return
    }

    try {
      setSaving(true)
      
      const slug = editingPost ? editingPost.slug : slugify(formData.title)
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      
      const postData = {
        title: formData.title.trim(),
        slug,
        content: formData.content,
        excerpt: formData.excerpt.trim() || null,
        featured_image_url: formData.featured_image_url.trim() || null,
        tags,
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null,
        status: formData.status,
        is_featured: formData.is_featured,
        published_at: formData.status === 'published' && (!editingPost || editingPost.status !== 'published') 
          ? new Date().toISOString() 
          : editingPost?.published_at || null,
        updated_at: new Date().toISOString()
      }

      if (editingPost) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id)

        if (error) throw error
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert({
            ...postData,
            author_id: user!.id,
            view_count: 0,
            created_at: new Date().toISOString()
          })

        if (error) throw error
      }

      resetForm()
      fetchPosts()
    } catch (error: any) {
      console.error('Error saving post:', error)
      alert('Failed to save post: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      
      fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  async function toggleFeatured(post: BlogPost) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          is_featured: !post.is_featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id)

      if (error) throw error
      
      fetchPosts()
    } catch (error) {
      console.error('Error toggling featured status:', error)
      alert('Failed to update featured status')
    }
  }

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Blog Management
          </h1>
          <p className="text-lg text-gray-600">
            Create, edit, and manage Bitcoin Cash articles and educational content.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-[#f39c12] hover:bg-[#d68910]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
          <div className="text-sm text-gray-600">Total Posts</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {posts.filter(p => p.status === 'published').length}
          </div>
          <div className="text-sm text-gray-600">Published</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {posts.filter(p => p.status === 'draft').length}
          </div>
          <div className="text-sm text-gray-600">Drafts</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {posts.filter(p => p.is_featured).length}
          </div>
          <div className="text-sm text-gray-600">Featured</div>
        </div>
      </div>

      {/* Blog Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPost ? 'Edit Post' : 'Create New Post'}
                </h2>
                <Button variant="ghost" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#f39c12] focus:border-[#f39c12]"
                    placeholder="Enter post title"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#f39c12] focus:border-[#f39c12]"
                    placeholder="Brief description of the post"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    modules={quillModules}
                    style={{ height: '300px', marginBottom: '50px' }}
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#f39c12] focus:border-[#f39c12]"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#f39c12] focus:border-[#f39c12]"
                    placeholder="bitcoin cash, news, analysis"
                  />
                </div>

                {/* SEO Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#f39c12] focus:border-[#f39c12]"
                      placeholder="SEO title for search engines"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Description
                    </label>
                    <input
                      type="text"
                      value={formData.seo_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#f39c12] focus:border-[#f39c12]"
                      placeholder="SEO description for search engines"
                    />
                  </div>
                </div>

                {/* Status and Featured */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#f39c12] focus:border-[#f39c12]"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="flex items-center mt-8">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-4 h-4 text-[#f39c12] border-gray-300 rounded focus:ring-[#f39c12]"
                    />
                    <label htmlFor="is_featured" className="ml-2 text-sm text-gray-700">
                      Featured Post
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#f39c12] hover:bg-[#d68910]"
                >
                  {saving ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-[#f39c12] focus:border-[#f39c12]"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#f39c12] focus:border-[#f39c12]"
          >
            <option value="all">All Posts</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
            <option value="featured">Featured</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            {posts.length} posts found
          </div>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No blog posts found.</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#f39c12] hover:bg-[#d68910]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Post
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {post.title}
                      </h3>
                      <div className="flex space-x-1">
                        {post.is_featured && (
                          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                            Featured
                          </span>
                        )}
                        <span className={`inline-block text-xs px-2 py-1 rounded ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                    
                    {post.excerpt && (
                      <p className="text-gray-600 mb-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{formatNumber(post.view_count)} views</span>
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(post)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFeatured(post)}
                      className={post.is_featured ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-400 hover:text-yellow-600'}
                    >
                      {post.is_featured ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}