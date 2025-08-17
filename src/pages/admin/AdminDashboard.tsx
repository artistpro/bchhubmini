import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Users, 
  Video, 
  FileText, 
  Settings, 
  Mail,
  TrendingUp,
  Calendar,
  Eye,
  Play
} from 'lucide-react'

export function AdminDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    channels: 0,
    videos: 0,
    blogPosts: 0,
    contactSubmissions: 0,
    featuredVideos: 0,
    publishedPosts: 0
  })
  const [loading, setLoading] = useState(true)

  // Fetch real statistics
  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch all stats in parallel
      const [channelsRes, videosRes, blogRes, contactRes, featuredRes, publishedRes] = await Promise.all([
        supabase.from('channels').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('is_published', true)
      ])

      setStats({
        channels: channelsRes.count || 0,
        videos: videosRes.count || 0,
        blogPosts: blogRes.count || 0,
        contactSubmissions: contactRes.count || 0,
        featuredVideos: featuredRes.count || 0,
        publishedPosts: publishedRes.count || 0
      })

    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const quickStats = [
    {
      label: 'Total Videos',
      value: loading ? '...' : stats.videos.toString(),
      icon: Video,
      color: 'text-[#16a085]',
      bgColor: 'bg-[#16a085]/10'
    },
    {
      label: 'Blog Posts',
      value: loading ? '...' : stats.blogPosts.toString(),
      icon: FileText,
      color: 'text-[#f39c12]',
      bgColor: 'bg-[#f39c12]/10'
    },
    {
      label: 'Active Channels',
      value: loading ? '...' : stats.channels.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Contact Messages',
      value: loading ? '...' : stats.contactSubmissions.toString(),
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  const quickActions = [
    {
      title: 'Manage YouTube Channels',
      description: 'Add, edit, or remove YouTube channels for content curation',
      icon: Video,
      href: '/admin/channels',
      color: 'border-[#16a085] text-[#16a085] hover:bg-[#16a085] hover:text-white'
    },
    {
      title: 'Review Videos',
      description: 'Approve, feature, or manage curated Bitcoin Cash videos',
      icon: Play,
      href: '/admin/videos',
      color: 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
    },
    {
      title: 'Manage Blog',
      description: 'Create, edit, and publish blog articles',
      icon: FileText,
      href: '/admin/blog',
      color: 'border-[#f39c12] text-[#f39c12] hover:bg-[#f39c12] hover:text-white'
    },
    {
      title: 'View Analytics',
      description: 'Monitor user engagement and content performance',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
    },
    {
      title: 'Contact Messages',
      description: 'Review and respond to user inquiries',
      icon: Mail,
      href: '/admin/contact',
      color: 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Welcome back, {profile?.full_name || 'Administrator'}!
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link key={index} to={action.href}>
                <div className={`border-2 rounded-lg p-4 transition-colors ${action.color}`}>
                  <div className="flex items-center mb-2">
                    <Icon className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">{action.title}</h3>
                  </div>
                  <p className="text-sm opacity-75">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Videos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Videos</h2>
          <div className="space-y-3">
            <div className="text-center text-gray-500 py-8">
              <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{stats.videos > 0 ? `${stats.videos} videos in database` : 'No recent videos to display'}</p>
              <Link to="/admin/channels">
                <Button size="sm" className="mt-2 bg-[#16a085] hover:bg-[#0e7a6b]">
                  {stats.channels > 0 ? 'Manage Videos' : 'Add YouTube Channels'}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Blog Posts</h2>
          <div className="space-y-3">
            <div className="text-center text-gray-500 py-8">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{stats.blogPosts > 0 ? `${stats.blogPosts} blog posts created` : 'No recent blog posts to display'}</p>
              <Link to="/admin/blog">
                <Button size="sm" className="mt-2 bg-[#f39c12] hover:bg-[#d68910]">
                  Create New Post
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-gradient-to-r from-[#16a085] to-[#f39c12] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">System Status</h2>
            <p className="opacity-90">
              All systems are operational. Content curation is running smoothly.
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm">All Services Online</span>
            </div>
            <p className="text-sm opacity-75">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}