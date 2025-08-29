import React, { useState } from 'react';
import { useYouTubeChannels, useYouTubeVideos } from '@/hooks/useYouTube';
import { Plus, Trash2, RefreshCw, Star, Eye, ThumbsUp, MessageCircle, Calendar } from 'lucide-react';

interface Channel {
  id: string;
  channel_id: string;
  channel_name: string;
  channel_description: string;
  channel_thumbnail: string;
  subscriber_count: number;
  video_count: number;
  is_active: boolean;
}

interface Video {
  id: string;
  video_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  channel_id: string;
  publish_date: string;
  duration: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_featured: boolean;
}

const YouTubeManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'channels' | 'videos'>('channels');
  const [newChannelInput, setNewChannelInput] = useState<string>('');
  const [isAddingChannel, setIsAddingChannel] = useState<boolean>(false);

  const {
    channels,
    loading: channelsLoading,
    error: channelsError,
    addChannel,
    deleteChannel
  } = useYouTubeChannels();

  const {
    videos,
    loading: videosLoading,
    error: videosError,
    fetchVideos,
    syncChannelVideos,
    toggleFeatured
  } = useYouTubeVideos();

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelInput.trim()) return;

    try {
      setIsAddingChannel(true);
      await addChannel(newChannelInput.trim());
      setNewChannelInput('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error al agregar canal: ' + errorMessage);
    } finally {
      setIsAddingChannel(false);
    }
  };

  const handleSyncChannel = async (channelId: string) => {
    try {
      const count = await syncChannelVideos(channelId);
      alert(`Se sincronizaron ${count} videos`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error al sincronizar: ' + errorMessage);
    }
  };

  const handleDeleteChannel = async (channelId: string, channelName: string) => {
    if (confirm(`¿Estás seguro de eliminar el canal "${channelName}"?`)) {
      await deleteChannel(channelId);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '';

    const hours = match[1] ? match[1].replace('H', '') + ':' : '';
    const minutes = match[2] ? match[2].replace('M', '').padStart(2, '0') : '00';
    const seconds = match[3] ? match[3].replace('S', '').padStart(2, '0') : '00';

    return `${hours}${minutes}:${seconds}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de YouTube
        </h1>
        <p className="text-gray-600">
          Administra canales de YouTube y sincroniza videos automáticamente
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('channels')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'channels'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Canales ({channels.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('videos');
              fetchVideos();
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'videos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Videos
          </button>
        </nav>
      </div>

      {/* Canales Tab */}
      {activeTab === 'channels' && (
        <div>
          {/* Add Channel Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Agregar Canal</h2>
            <form onSubmit={handleAddChannel} className="flex gap-4">
              <input
                type="text"
                value={newChannelInput}
                onChange={(e) => setNewChannelInput(e.target.value)}
                placeholder="ID del canal o nombre de usuario (ej: @username)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isAddingChannel}
              />
              <button
                type="submit"
                disabled={isAddingChannel || !newChannelInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isAddingChannel ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isAddingChannel ? 'Agregando...' : 'Agregar'}
              </button>
            </form>
          </div>

          {/* Channels List */}
          {channelsLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Cargando canales...</p>
            </div>
          ) : channelsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Error: {channelsError}</p>
            </div>
          ) : channels.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay canales agregados</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {channels.map((channel: Channel) => (
                <div key={channel.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={channel.channel_thumbnail}
                      alt={channel.channel_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {channel.channel_name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {channel.channel_description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>{formatNumber(channel.subscriber_count)} suscriptores</span>
                        <span>{formatNumber(channel.video_count)} videos</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          channel.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {channel.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSyncChannel(channel.channel_id)}
                        disabled={videosLoading}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200 flex items-center gap-2 text-sm"
                      >
                        <RefreshCw className={`h-4 w-4 ${videosLoading ? 'animate-spin' : ''}`} />
                        Sincronizar
                      </button>
                      <button
                        onClick={() => handleDeleteChannel(channel.id, channel.channel_name)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md border border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div>
          {videosLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Cargando videos...</p>
            </div>
          ) : videosError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Error: {videosError}</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay videos sincronizados</p>
              <p className="text-gray-400 text-sm mt-1">
                Sincroniza algunos canales para ver los videos aquí
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {videos.map((video: Video) => (
                <div key={video.id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex gap-4">
                    <div className="relative">
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-48 h-28 object-cover rounded-lg"
                      />
                      {video.duration && (
                        <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                          {formatDuration(video.duration)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {video.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {formatNumber(video.view_count)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {formatNumber(video.like_count)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {formatNumber(video.comment_count)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(video.publish_date).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          video.is_featured
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {video.is_featured ? 'Destacado' : 'Normal'}
                        </span>
                        <button
                          onClick={() => toggleFeatured(video.id)}
                          className="px-3 py-1 text-yellow-600 hover:bg-yellow-50 rounded-md border border-yellow-200 flex items-center gap-1 text-sm"
                        >
                          <Star className={`h-4 w-4 ${video.is_featured ? 'fill-current' : ''}`} />
                          {video.is_featured ? 'Quitar destaque' : 'Destacar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default YouTubeManager;
