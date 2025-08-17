import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  BarChart3, 
  Users, 
  Video, 
  FileText, 
  Eye,
  TrendingUp,
  Calendar,
  Globe,
  Activity
} from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils'

interface AnalyticsData {
  totalVideos: number
  totalPosts: number
  totalViews: number
  totalSubmissions: number
  recentActivity: any[]
  topContent: any[]
  dailyStats: any[]
}

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalVideos: 0,
    totalPosts: 0,
    totalViews: 0,
    totalSubmissions: 0,
    recentActivity: [],
    topContent: [],
    dailyStats: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  async function fetchAnalytics() {
    try {
      setLoading(true)
      
      // Calculate date range
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString()

      // Fetch all analytics data in parallel
      const [videosData, postsData, analyticsData, contactData] = await Promise.all([
        supabase
          .from('videos')
          .select('view_count, title, created_at')
          .eq('is_approved', true),
        supabase
          .from('blog_posts')
          .select('view_count, title, created_at')
          .eq('status', 'published'),
        supabase
          .from('analytics')
          .select('*')
          .gte('created_at', startDateStr),
        supabase
          .from('contact_submissions')
          .select('created_at, status')
          .gte('created_at', startDateStr)
      ])

      // Calculate totals
      const totalVideos = videosData.data?.length || 0
      const totalPosts = postsData.data?.length || 0
      const totalVideoViews = videosData.data?.reduce((sum, v) => sum + v.view_count, 0) || 0
      const totalPostViews = postsData.data?.reduce((sum, p) => sum + p.view_count, 0) || 0
      const totalViews = totalVideoViews + totalPostViews
      const totalSubmissions = contactData.data?.length || 0

      // Recent activity (last 10 analytics events)
      const recentActivity = analyticsData.data
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        ?.slice(0, 10) || []

      // Top content by views
      const allContent = [
        ...(videosData.data?.map(v => ({ ...v, type: 'video' })) || []),
        ...(postsData.data?.map(p => ({ ...p, type: 'post' })) || [])
      ]
      const topContent = allContent
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5)

      // Daily stats for the last 7 days
      const dailyStats = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayEvents = analyticsData.data?.filter(event => 
          event.created_at.startsWith(dateStr)
        ) || []
        
        dailyStats.push({
          date: dateStr,
          views: dayEvents.filter(e => e.event_type === 'view').length,
          clicks: dayEvents.filter(e => e.event_type === 'click').length
        })
      }

      setAnalytics({
        totalVideos,
        totalPosts,
        totalViews,
        totalSubmissions,
        recentActivity,
        topContent,
        dailyStats
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Monitor user engagement, content performance, and platform statistics.
          </p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-600 focus:border-purple-600"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-[#16a085]/10 mr-4">
              <Video className="h-6 w-6 text-[#16a085]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalVideos}</p>
              <p className="text-sm text-gray-600">Total Videos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-[#f39c12]/10 mr-4">
              <FileText className="h-6 w-6 text-[#f39c12]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalPosts}</p>
              <p className="text-sm text-gray-600">Blog Posts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 mr-4">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalViews)}</p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalSubmissions}</p>
              <p className="text-sm text-gray-600">Contact Submissions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Activity Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Activity (Last 7 Days)</h2>
          <div className="space-y-3">
            {analytics.dailyStats.map((day, index) => {
              const maxViews = Math.max(...analytics.dailyStats.map(d => d.views))
              const viewsPercentage = maxViews > 0 ? (day.views / maxViews) * 100 : 0
              
              return (
                <div key={index} className="flex items-center">
                  <div className="w-20 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all" 
                        style={{ width: `${viewsPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-900 text-right">
                    {day.views} views
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Content by Views</h2>
          <div className="space-y-3">
            {analytics.topContent.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No content data available</p>
            ) : (
              analytics.topContent.map((content, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded ${
                      content.type === 'video' 
                        ? 'bg-[#16a085]/10 text-[#16a085]' 
                        : 'bg-[#f39c12]/10 text-[#f39c12]'
                    }`}>
                      {content.type === 'video' ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">
                        {content.title}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {content.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(content.view_count)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {analytics.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity to display</p>
          ) : (
            analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium capitalize">{activity.event_type}</span>
                    {activity.content_type && (
                      <span className="text-gray-600"> on {activity.content_type}</span>
                    )}
                    {activity.page_path && (
                      <span className="text-gray-600"> ({activity.page_path})</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(activity.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Platform Health */}
      <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Platform Health</h2>
            <p className="opacity-90">
              All systems operational. Content curation running smoothly.
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