// Tipos TypeScript para la API de YouTube
interface YouTubeChannelSnippet {
  title: string;
  description: string;
  thumbnails: {
    high?: {
      url: string;
    };
  };
}

interface YouTubeChannelStatistics {
  subscriberCount: string;
  videoCount: string;
}

interface YouTubeChannelItem {
  id: string;
  snippet: YouTubeChannelSnippet;
  statistics: YouTubeChannelStatistics;
}

interface YouTubeChannelResponse {
  items: YouTubeChannelItem[];
}

interface YouTubeVideoSnippet {
  title: string;
  description: string;
  channelId: string;
  publishedAt: string;
  thumbnails: {
    high?: {
      url: string;
    };
  };
}

interface YouTubeVideoStatistics {
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
}

interface YouTubeVideoContentDetails {
  duration: string;
}

interface YouTubeVideoItem {
  id: string;
  snippet: YouTubeVideoSnippet;
  statistics: YouTubeVideoStatistics;
  contentDetails: YouTubeVideoContentDetails;
}

interface YouTubeVideoResponse {
  items: YouTubeVideoItem[];
}

interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
}

// Tipos para nuestros objetos de respuesta
interface ChannelInfo {
  channel_id: string;
  channel_name: string;
  channel_description: string;
  channel_thumbnail: string;
  subscriber_count: number;
  video_count: number;
  is_active: boolean;
}

interface VideoInfo {
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

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export class YouTubeService {
  // Obtener información del canal
  static async getChannelInfo(channelId: string): Promise<ChannelInfo> {
    try {
      const response = await fetch(
        `${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: YouTubeChannelResponse = await response.json();
      
      if (data.items && data.items.length > 0) {
        const channel = data.items[0];
        return {
          channel_id: channel.id,
          channel_name: channel.snippet.title,
          channel_description: channel.snippet.description,
          channel_thumbnail: channel.snippet.thumbnails.high?.url || '',
          subscriber_count: parseInt(channel.statistics.subscriberCount) || 0,
          video_count: parseInt(channel.statistics.videoCount) || 0,
          is_active: true
        };
      }
      throw new Error('Canal no encontrado');
    } catch (error) {
      console.error('Error al obtener info del canal:', error);
      throw error;
    }
  }

  // Buscar canal por nombre de usuario
  static async getChannelByUsername(username: string): Promise<ChannelInfo> {
    try {
      // Limpiar el username si viene con @
      const cleanUsername = username.replace('@', '');
      
      const response = await fetch(
        `${BASE_URL}/channels?part=snippet,statistics&forUsername=${cleanUsername}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: YouTubeChannelResponse = await response.json();
      
      if (data.items && data.items.length > 0) {
        return this.getChannelInfo(data.items[0].id);
      }
      throw new Error('Canal no encontrado');
    } catch (error) {
      console.error('Error al buscar canal:', error);
      throw error;
    }
  }

  // Obtener videos de un canal
  static async getChannelVideos(channelId: string, maxResults: number = 50): Promise<VideoInfo[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: YouTubeSearchResponse = await response.json();
      
      if (data.items && data.items.length > 0) {
        const videoIds = data.items.map(item => item.id.videoId).join(',');
        
        // Obtener estadísticas de los videos
        const statsResponse = await fetch(
          `${BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        );
        
        if (!statsResponse.ok) {
          throw new Error(`HTTP error! status: ${statsResponse.status}`);
        }
        
        const statsData: YouTubeVideoResponse = await statsResponse.json();
        
        return statsData.items.map(video => ({
          video_id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail_url: video.snippet.thumbnails.high?.url || '',
          channel_id: video.snippet.channelId,
          publish_date: video.snippet.publishedAt,
          duration: video.contentDetails.duration,
          view_count: parseInt(video.statistics.viewCount || '0'),
          like_count: parseInt(video.statistics.likeCount || '0'),
          comment_count: parseInt(video.statistics.commentCount || '0'),
          is_featured: false
        }));
      }
      return [];
    } catch (error) {
      console.error('Error al obtener videos:', error);
      throw error;
    }
  }
}
