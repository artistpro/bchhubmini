import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Video, FileText, BarChart3, Mail } from 'lucide-react';

// This is handled by AdminVideos.tsx now
export function AdminVideos() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Video Management</h1>
        <p className="text-gray-600 mb-6">Review and manage curated Bitcoin Cash videos from your channels.</p>
        <Button className="bg-[#16a085] hover:bg-[#0e7a6b]">Coming Soon</Button>
      </div>
    </div>
  )
}

// AdminBlog is handled by AdminBlog.tsx
export function AdminBlog() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Management</h1>
        <p className="text-gray-600 mb-6">Create, edit, and publish Bitcoin Cash articles and educational content.</p>
        <Button className="bg-[#f39c12] hover:bg-[#d68910]">Coming Soon</Button>
      </div>
    </div>
  )
}

export function AdminAnalytics() {
  const [stats, setStats] = useState({
    channels: 0,
    videos: 0,
    blogPosts: 0,
    contactSubmissions: 0,
    featuredVideos: 0,
    publishedPosts: 0
  });
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
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <button
            onClick={fetchStats}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
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

        {/* Platform Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-2">Content Summary</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• {stats.channels} YouTube channels being monitored</li>
                <li>• {stats.videos} videos in the database</li>
                <li>• {stats.featuredVideos} videos currently featured</li>
                <li>• {stats.blogPosts} blog posts created</li>
                <li>• {stats.publishedPosts} blog posts published</li>
              </ul>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-2">Engagement</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• {stats.contactSubmissions} contact form submissions</li>
                <li>• Content curation running automatically</li>
                <li>• Platform status: Operational</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminContact() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch contact submissions
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  };

  // Mark as read/unread
  const toggleRead = async (contactId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ is_read: !currentStatus })
        .eq('id', contactId);

      if (error) throw error;

      setSuccess('Contact status updated!');
      fetchContacts();
    } catch (err) {
      console.error('Error updating contact:', err);
      setError('Failed to update contact status');
    }
  };

  // Delete contact
  const deleteContact = async (contactId) => {
    if (!confirm('Are you sure you want to delete this contact submission?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setSuccess('Contact deleted successfully!');
      fetchContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact');
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
          <button
            onClick={fetchContacts}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Contact Submissions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Contact Submissions ({contacts.length})</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No contact submissions yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {contacts.map((contact) => (
                <div key={contact.id} className={`p-6 hover:bg-gray-50 ${!contact.is_read ? 'bg-blue-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{contact.subject}</h3>
                        {!contact.is_read && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          <strong>From:</strong> {contact.name} ({contact.email})
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(contact.created_at).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="text-gray-700">
                        <p className="whitespace-pre-wrap">{contact.message}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => toggleRead(contact.id, contact.is_read)}
                        className={`text-white px-3 py-1 rounded text-xs ${
                          contact.is_read
                            ? 'bg-gray-600 hover:bg-gray-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {contact.is_read ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button
                        onClick={() => deleteContact(contact.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}