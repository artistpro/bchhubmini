import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const ChannelManagement = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingChannel, setAddingChannel] = useState(false);
  const [newChannelId, setNewChannelId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch existing channels
  const fetchChannels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (err) {
      console.error('Error fetching channels:', err);
      setError('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  // Add new channel
  const addChannel = async (e) => {
    e.preventDefault();
    if (!newChannelId.trim()) {
      setError('Please enter a valid YouTube Channel ID');
      return;
    }

    try {
      setAddingChannel(true);
      setError('');
      setSuccess('');

      // Call the Edge Function to fetch channel data
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'youtube-channel-fetch',
        {
          body: { channelId: newChannelId.trim() }
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Failed to fetch channel data');
      }

      if (functionData?.error) {
        throw new Error(functionData.error);
      }

      setSuccess('Channel added successfully!');
      setNewChannelId('');
      fetchChannels(); // Refresh the list
    } catch (err) {
      console.error('Error adding channel:', err);
      setError(err.message || 'Failed to add channel');
    } finally {
      setAddingChannel(false);
    }
  };

  // Delete channel
  const deleteChannel = async (channelId) => {
    if (!confirm('Are you sure you want to delete this channel? This will also remove all associated videos.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('youtube_channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;

      setSuccess('Channel deleted successfully!');
      fetchChannels(); // Refresh the list
    } catch (err) {
      console.error('Error deleting channel:', err);
      setError('Failed to delete channel');
    }
  };

  // Toggle channel active status
  const toggleChannelStatus = async (channelId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('youtube_channels')
        .update({ is_active: !currentStatus })
        .eq('id', channelId);

      if (error) throw error;

      setSuccess('Channel status updated!');
      fetchChannels(); // Refresh the list
    } catch (err) {
      console.error('Error updating channel status:', err);
      setError('Failed to update channel status');
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Channel Management</h1>
        <button
          onClick={fetchChannels}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
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

      {/* Add New Channel Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Add New YouTube Channel</h2>
        <form onSubmit={addChannel} className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="channelId" className="block text-sm font-medium text-gray-700 mb-2">
              YouTube Channel ID
            </label>
            <input
              type="text"
              id="channelId"
              value={newChannelId}
              onChange={(e) => setNewChannelId(e.target.value)}
              placeholder="UCyYmT5Z_edrBpZ9ABCD..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
              disabled={addingChannel}
            />
            <p className="text-sm text-gray-500 mt-1">
              Find the Channel ID in the YouTube channel URL or About section
            </p>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={addingChannel}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingChannel ? 'Adding...' : 'Add Channel'}
            </button>
          </div>
        </form>
      </div>

      {/* Channels List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Managed Channels ({channels.length})</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading channels...</p>
          </div>
        ) : channels.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No channels added yet. Add your first YouTube channel above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {channels.map((channel) => (
                  <tr key={channel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {channel.thumbnail_url && (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={channel.thumbnail_url}
                            alt={channel.title}
                          />
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {channel.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {channel.channel_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {channel.subscriber_count && (
                          <p>{parseInt(channel.subscriber_count).toLocaleString()} subscribers</p>
                        )}
                        {channel.video_count && (
                          <p>{parseInt(channel.video_count).toLocaleString()} videos</p>
                        )}
                        <p className="text-gray-500">
                          Added {new Date(channel.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          channel.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {channel.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => toggleChannelStatus(channel.id, channel.is_active)}
                        className={`text-white px-3 py-1 rounded text-xs ${
                          channel.is_active
                            ? 'bg-yellow-600 hover:bg-yellow-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {channel.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteChannel(channel.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelManagement;
