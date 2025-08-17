import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    channels: 0,
    videos: 0,
    blogPosts: 0,
    contactSubmissions: 0,
    featuredVideos: 0,
    publishedPosts: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [channelsRes, videosRes, blogRes, contactRes, featuredRes, publishedRes] = await Promise.all([
        supabase.from('channels').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('is_published', true)
      ]);

      setStats({
        channels: channelsRes.count || 0,
        videos: videosRes.count || 0,
        blogPosts: blogRes.count || 0,
        contactSubmissions: contactRes.count || 0,
        featuredVideos: featuredRes.count || 0,
        publishedPosts: publishedRes.count || 0
      });

    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      // Get recent videos
      const { data: recentVideos } = await supabase
        .from('videos')
        .select(`
          id, title, created_at,
          channels!inner(title)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent blog posts
      const { data: recentPosts } = await supabase
        .from('blog_posts')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent contact submissions
      const { data: recentContacts } = await supabase
        .from('contact_submissions')
        .select('id, name, subject, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort all activities
      const activities = [
        ...(recentVideos || []).map(v => ({
          type: 'video',
          title: v.title,
          subtitle: `New video from ${v.channels?.title}`,
          timestamp: v.created_at
        })),
        ...(recentPosts || []).map(p => ({
          type: 'blog',
          title: p.title,
          subtitle: 'New blog post created',
          timestamp: p.created_at
        })),
        ...(recentContacts || []).map(c => ({
          type: 'contact',
          title: c.subject,
          subtitle: `New contact from ${c.name}`,
          timestamp: c.created_at
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

      setRecentActivity(activities);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const statCards = [
    {
      title: 'YouTube Channels',
      value: stats.channels,
      icon: '📺',
      color: 'bg-red-500'
    },
    {
      title: 'Total Videos',
      value: stats.videos,
      icon: '🎥',
      color: 'bg-blue-500'
    },
    {
      title: 'Featured Videos',
      value: stats.featuredVideos,
      icon: '⭐',
      color: 'bg-yellow-500'
    },
    {
      title: 'Blog Posts',
      value: stats.blogPosts,
      icon: '📝',
      color: 'bg-green-500'
    },
    {
      title: 'Published Posts',
      value: stats.publishedPosts,
      icon: '📢',
      color: 'bg-indigo-500'
    },
    {
      title: 'Contact Messages',
      value: stats.contactSubmissions,
      icon: '📨',
      color: 'bg-purple-500'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'video': return '🎥';
      case 'blog': return '📝';
      case 'contact': return '📨';
      default: return '🔔';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <button
          onClick={() => {
            fetchStats();
            fetchRecentActivity();
          }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3 text-white text-2xl mr-4`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity to display.</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">{activity.subtitle}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={async () => {
                try {
                  await supabase.functions.invoke('youtube-video-sync');
                  alert('Video sync started! Check Content Management for new videos.');
                } catch (err) {
                  alert('Failed to start video sync');
                }
              }}
              className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="text-sm font-medium">Sync Videos</div>
            </button>
            
            <button
              onClick={() => window.open('/admin/channels', '_self')}
              className="bg-red-600 text-white p-4 rounded-lg hover:bg-red-700 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📺</div>
              <div className="text-sm font-medium">Manage Channels</div>
            </button>
            
            <button
              onClick={() => window.open('/admin/blog', '_self')}
              className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="text-sm font-medium">New Blog Post</div>
            </button>
            
            <button
              onClick={() => window.open('/admin/content', '_self')}
              className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🎥</div>
              <div className="text-sm font-medium">Manage Content</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;