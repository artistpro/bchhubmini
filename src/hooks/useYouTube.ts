import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { YouTubeService } from '../services/youtube';

// Tipos TypeScript
interface YouTubeChannel {
  id: string;
  channel_id: string;
  channel_name: string;
  channel_description: string;
  channel_thumbnail: string;
  subscriber_count: number;
  video_count: number;
  is_active: boolean;
  created_at?: string;
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

interface UseYouTubeChannelsReturn {
  channels: YouTubeChannel[];
  loading: boolean;
  error: string | null;
  addChannel: (channelInput: string) => Promise<YouTubeChannel>;
  deleteChannel: (channelId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

interface UseYouTubeVideosReturn {
  videos: Video[];
  loading: boolean;
  error: string | null;
  fetchVideos: (channelId?: string | null) => Promise<void>;
  syncChannelVideos: (channelId: string) => Promise<number>;
  toggleFeatured: (videoId: string) => Promise<void>;
}

export const useYouTubeChannels = (): UseYouTubeChannelsReturn => {
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addChannel = async (channelInput: string): Promise<YouTubeChannel> => {
    try {
      setLoading(true);
      let channelInfo;

      // Detectar si es ID o username
      if (channelInput.startsWith('UC') && channelInput.length === 24) {
        channelInfo = await YouTubeService.getChannelInfo(channelInput);
      } else {
        channelInfo = await YouTubeService.getChannelByUsername(channelInput);
      }

      // Guardar en Supabase
      const { data, error } = await supabase
        .from('youtube_channels')
        .insert([channelInfo])
        .select();

      if (error) throw error;

      // Actualizar lista
      setChannels(prev => [data[0], ...prev]);
      return data[0];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteChannel = async (channelId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('youtube_channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;

      setChannels(prev => prev.filter(ch => ch.id !== channelId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  return {
    channels,
    loading,
    error,
    addChannel,
    deleteChannel,
    refetch: fetchChannels
  };
};

export const useYouTubeVideos = (): UseYouTubeVideosReturn => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async (channelId: string | null = null): Promise<void> => {
    try {
      setLoading(true);
      let query = supabase
        .from('videos')
        .select('*')
        .order('publish_date', { ascending: false });

      if (channelId) {
        query = query.eq('channel_id', channelId);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const syncChannelVideos = async (channelId: string): Promise<number> => {
    try {
      setLoading(true);
      const videos = await YouTubeService.getChannelVideos(channelId);

      // Insertar videos en lotes
      for (const video of videos) {
        const { error } = await supabase
          .from('videos')
          .upsert([video], {
            onConflict: 'video_id',
            ignoreDuplicates: false
          });

        if (error && !error.message.includes('duplicate')) {
          console.error('Error al insertar video:', error);
        }
      }

      // Refrescar lista
      await fetchVideos();
      return videos.length;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (videoId: string): Promise<void> => {
    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) return;

      const { error } = await supabase
        .from('videos')
        .update({ is_featured: !video.is_featured })
        .eq('id', videoId);

      if (error) throw error;

      setVideos(prev => prev.map(v =>
        v.id === videoId ? { ...v, is_featured: !v.is_featured } : v
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    }
  };

  return {
    videos,
    loading,
    error,
    fetchVideos,
    syncChannelVideos,
    toggleFeatured
  };
};
