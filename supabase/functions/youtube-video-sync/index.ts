Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    console.log('Starting YouTube video sync...');
    
    const youtubeApiKey = 'AIzaSyAWvN1svGX7xL7v7Bs4CrA7XcQAyVo94pE';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Fetch active channels from database
    const channelsResponse = await fetch(`${supabaseUrl}/rest/v1/youtube_channels?is_active=eq.true&select=*`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });
    
    if (!channelsResponse.ok) {
      throw new Error('Failed to fetch channels from database');
    }
    
    const channels = await channelsResponse.json();
    console.log(`Found ${channels.length} active channels`);
    
    let totalNewVideos = 0;
    
    for (const channel of channels) {
      try {
        console.log(`Syncing videos for channel: ${channel.channel_name}`);
        
        // Fetch latest videos from YouTube API
        const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.channel_id}&type=video&order=date&maxResults=10&key=${youtubeApiKey}`;
        
        const videosResponse = await fetch(videosUrl);
        const videosData = await videosResponse.json();
        
        if (!videosResponse.ok) {
          console.error(`YouTube API error for channel ${channel.channel_name}:`, videosData.error);
          continue;
        }
        
        if (!videosData.items || videosData.items.length === 0) {
          console.log(`No videos found for channel: ${channel.channel_name}`);
          continue;
        }
        
        // Filter videos for Bitcoin Cash content
        const bchKeywords = ['bitcoin cash', 'bch', 'bitcoin cash', 'bitcoincash'];
        const relevantVideos = videosData.items.filter(video => {
          const title = video.snippet.title.toLowerCase();
          const description = video.snippet.description.toLowerCase();
          return bchKeywords.some(keyword => 
            title.includes(keyword) || description.includes(keyword)
          );
        });
        
        console.log(`Found ${relevantVideos.length} BCH-related videos for ${channel.channel_name}`);
        
        for (const video of relevantVideos) {
          // Check if video already exists
          const existingVideoResponse = await fetch(
            `${supabaseUrl}/rest/v1/videos?video_id=eq.${video.id.videoId}&select=id`, 
            {
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey
              }
            }
          );
          
          const existingVideos = await existingVideoResponse.json();
          
          if (existingVideos.length > 0) {
            console.log(`Video already exists: ${video.snippet.title}`);
            continue;
          }
          
          // Prepare video data
          const videoData = {
            video_id: video.id.videoId,
            channel_id: channel.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail_url: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
            published_at: video.snippet.publishedAt,
            is_approved: true, // Auto-approve BCH content
            is_featured: false,
            is_hidden: false
          };
          
          // Insert video into database
          const insertVideoResponse = await fetch(`${supabaseUrl}/rest/v1/videos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey
            },
            body: JSON.stringify(videoData)
          });
          
          if (insertVideoResponse.ok) {
            totalNewVideos++;
            console.log(`Added new video: ${video.snippet.title}`);
          } else {
            const errorText = await insertVideoResponse.text();
            console.error(`Failed to insert video: ${errorText}`);
          }
        }
        
      } catch (channelError) {
        console.error(`Error processing channel ${channel.channel_name}:`, channelError);
        continue;
      }
    }
    
    console.log(`Video sync completed. Added ${totalNewVideos} new videos.`);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: `Sync completed successfully. Added ${totalNewVideos} new videos.`,
      newVideosCount: totalNewVideos,
      channelsProcessed: channels.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in youtube-video-sync:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});