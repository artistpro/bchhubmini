import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const ContentManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'featured', 'hidden'
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const videosPerPage = 20;

  // Fetch videos with filters
  const fetchVideos = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('videos')
        .select(`
          *,
          channels!inner(title, channel_id)
        `, { count: 'exact' })
        .order('published_at', { ascending: false });

      // Apply filters
      if (filter === 'featured') {
        query = query.eq('is_featured', true);
      } else if (filter === 'hidden') {
        query = query.eq('is_hidden', true);
      }

      // Apply search
      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply pagination
      const from = (currentPage - 1) * videosPerPage;
      const to = from + videosPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setVideos(data || []);
      setTotalPages(Math.ceil((count || 0) / videosPerPage));
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  // Toggle featured status
  const toggleFeatured = async (videoId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_featured: !currentStatus })
        .eq('id', videoId);

      if (error) throw error;

      setSuccess('Video status updated!');
      fetchVideos();
    } catch (err) {
      console.error('Error updating video:', err);
      setError('Failed to update video status');
    }
  };

  // Toggle hidden status
  const toggleHidden = async (videoId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_hidden: !currentStatus })
        .eq('id', videoId);

      if (error) throw error;

      setSuccess('Video visibility updated!');
      fetchVideos();
    } catch (err) {
      console.error('Error updating video:', err);
      setError('Failed to update video visibility');
    }
  };

  // Delete video
  const deleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      setSuccess('Video deleted successfully!');
      fetchVideos();
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Failed to delete video');
    }
  };

  // Sync videos manually
  const syncVideos = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const { data, error } = await supabase.functions.invoke('youtube-video-sync');

      if (error) throw error;

      setSuccess('Video sync completed! New videos have been fetched.');
      fetchVideos();
    } catch (err) {
      console.error('Error syncing videos:', err);
      setError('Failed to sync videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [currentPage, filter, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <button
          onClick={syncVideos}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Syncing...' : 'Sync Videos'}
        </button>
      </div>

      {/* Alert Messages */}
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

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Videos
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Videos</option>
              <option value="featured">Featured Only</option>
              <option value="hidden">Hidden Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Videos List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Videos ({videos.length})</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No videos found. Try adjusting your filters or sync new videos.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {videos.map((video) => (
                <div key={video.id} className="p-6 hover:bg-gray-50">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-20 w-36 object-cover rounded"
                        src={video.thumbnail_url}
                        alt={video.title}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {video.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {video.channels?.title} • {new Date(video.published_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {video.description?.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {parseInt(video.view_count || 0).toLocaleString()} views
                            </span>
                            {video.is_featured && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                            {video.is_hidden && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => toggleFeatured(video.id, video.is_featured)}
                            className={`text-white px-3 py-1 rounded text-xs ${
                              video.is_featured
                                ? 'bg-yellow-600 hover:bg-yellow-700'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {video.is_featured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            onClick={() => toggleHidden(video.id, video.is_hidden)}
                            className={`text-white px-3 py-1 rounded text-xs ${
                              video.is_hidden
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-600 hover:bg-gray-700'
                            }`}
                          >
                            {video.is_hidden ? 'Unhide' : 'Hide'}
                          </button>
                          <button
                            onClick={() => deleteVideo(video.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContentManagement;