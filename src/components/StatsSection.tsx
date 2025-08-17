import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Play, FileText, Users, TrendingUp } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export function StatsSection() {
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalPosts: 0,
    totalChannels: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      setLoading(true)
      
      // Fetch all stats in parallel
      const [videosData, postsData, channelsData] = await Promise.all([
        supabase
          .from('videos')
          .select('view_count')
          .eq('is_approved', true),
        supabase
          .from('blog_posts')
          .select('view_count')
          .eq('status', 'published'),
        supabase
          .from('youtube_channels')
          .select('id')
          .eq('is_active', true)
      ])

      const totalVideos = videosData.data?.length || 0
      const totalPosts = postsData.data?.length || 0
      const totalChannels = channelsData.data?.length || 0
      const totalViews = (
        (videosData.data?.reduce((sum, video) => sum + video.view_count, 0) || 0) +
        (postsData.data?.reduce((sum, post) => sum + post.view_count, 0) || 0)
      )

      setStats({
        totalVideos,
        totalPosts,
        totalChannels,
        totalViews
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statItems = [
    {
      label: 'BCH Videos',
      value: stats.totalVideos,
      icon: Play,
      color: 'text-[#16a085]'
    },
    {
      label: 'Articles',
      value: stats.totalPosts,
      icon: FileText,
      color: 'text-[#f39c12]'
    },
    {
      label: 'Channels',
      value: stats.totalChannels,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Total Views',
      value: stats.totalViews,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  if (loading) {
    return (
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4 ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(item.value)}
                </div>
                <div className="text-sm text-gray-600">
                  {item.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}