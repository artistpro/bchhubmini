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
    const { channelId } = await req.json();
    
    if (!channelId) {
      throw new Error('Channel ID or URL is required');
    }

    // Extract channel ID from various YouTube URL formats
    const extractChannelId = (input) => {
      const cleanInput = input.trim();
      
      // If it's already a channel ID (starts with UC and is ~24 chars)
      if (cleanInput.startsWith('UC') && cleanInput.length >= 22) {
        return cleanInput;
      }
      
      // Extract from @username format
      if (cleanInput.includes('@')) {
        const username = cleanInput.split('@')[1].split('/')[0].split('?')[0];
        return `@${username}`;
      }
      
      // Extract from /channel/ URLs
      const channelMatch = cleanInput.match(/\/channel\/([a-zA-Z0-9_-]+)/);
      if (channelMatch) {
        return channelMatch[1];
      }
      
      // Extract from /c/ URLs
      const cMatch = cleanInput.match(/\/c\/([a-zA-Z0-9_-]+)/);
      if (cMatch) {
        return `@${cMatch[1]}`;
      }
      
      // Extract from /user/ URLs
      const userMatch = cleanInput.match(/\/user\/([a-zA-Z0-9_-]+)/);
      if (userMatch) {
        return `@${userMatch[1]}`;
      }
      
      // If none of the above, assume it's a username or handle
      return cleanInput.startsWith('@') ? cleanInput : `@${cleanInput}`;
    };

    const processedChannelId = extractChannelId(channelId);
    const youtubeApiKey = 'AIzaSyAWvN1svGX7xL7v7Bs4CrA7XcQAyVo94pE';
    
    // First, if it's a @username, we need to get the actual channel ID
    let actualChannelId = processedChannelId;
    
    if (processedChannelId.startsWith('@')) {
      // Search for the channel by handle
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(processedChannelId)}&key=${youtubeApiKey}`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (!searchResponse.ok) {
        throw new Error(`YouTube API Error: ${searchData.error?.message || 'Failed to search for channel'}`);
      }
      
      if (!searchData.items || searchData.items.length === 0) {
        throw new Error(`Channel not found: ${processedChannelId}`);
      }
      
      actualChannelId = searchData.items[0].snippet.channelId;
    }
    
    // Fetch channel details using the actual channel ID
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${actualChannelId}&key=${youtubeApiKey}`;
    
    const response = await fetch(channelUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`YouTube API Error: ${data.error?.message || 'Failed to fetch channel data'}`);
    }
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Channel not found or invalid Channel ID');
    }
    
    const channel = data.items[0];
    const snippet = channel.snippet;
    const statistics = channel.statistics;
    
    // Prepare channel data for database
    const channelData = {
      channel_id: actualChannelId,
      title: snippet.title,
      description: snippet.description,
      thumbnail_url: snippet.thumbnails?.default?.url || snippet.thumbnails?.medium?.url,
      subscriber_count: parseInt(statistics.subscriberCount || 0),
      video_count: parseInt(statistics.videoCount || 0),
      view_count: parseInt(statistics.viewCount || 0),
      published_at: snippet.publishedAt,
      is_active: true
    };
    
    // Insert into database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/channels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(channelData)
    });
    
    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      throw new Error(`Database error: ${errorText}`);
    }
    
    const insertedChannel = await insertResponse.json();
    
    return new Response(JSON.stringify({ 
      success: true,
      channel: insertedChannel[0],
      message: `Channel "${snippet.title}" added successfully!`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in youtube-channel-fetch:', error);
    
    const errorResponse = {
      error: error.message,
      success: false
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});