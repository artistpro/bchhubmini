import React, { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Play, ArrowLeft, Share2 } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'
import { SocialShareButtons } from '@/components/SocialShareButtons'

interface Video {
  id: string
  video_id: string
  title: string
  description?: string
  thumbnail_url?: string
  publish_date?: string
  duration?: string
  view_count: number
  is_featured: boolean
  matched_keywords?: string[]
}

export function VideoPage() {
  const { videoId } = useParams<{ videoId: string }>()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showVideo, setShowVideo] = useState(false)
  const [showShareButtons, setShowShareButtons] = useState(false)

  useEffect(() => {
    if (videoId) {
      fetchVideo()
    }
  }, [videoId])

  async function fetchVideo() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('video_id', videoId)
        .eq('is_approved', true)
        .maybeSingle()

      if (error) throw error
      
      if (data) {
        setVideo(data)
      } else {
        setError('Video not found')
      }
    } catch (error) {
      console.error('Error fetching video:', error)
      setError('Failed to load video')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !video) {
    return <Navigate to="/videos" replace />
  }

  const videoUrl = `${window.location.origin}/video/${video.video_id}`
  const shareTitle = `${video.title} - BCH Content Hub`
  const shareDescription = video.description || `Watch this Bitcoin Cash video on BCH Content Hub: ${video.title}`

  return (
    <>
      <Helmet>
        <title>{shareTitle}</title>
        <meta name="description" content={shareDescription} />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={shareTitle} />
        <meta property="og:description" content={shareDescription} />
        <meta property="og:image" content={video.thumbnail_url || `${window.location.origin}/images/bch-hub-preview.jpg`} />
        <meta property="og:url" content={videoUrl} />
        <meta property="og:type" content="video.other" />
        <meta property="og:site_name" content="BCH Content Hub" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={shareTitle} />
        <meta name="twitter:description" content={shareDescription} />
        <meta name="twitter:image" content={video.thumbnail_url || `${window.location.origin}/images/bch-hub-preview.jpg`} />
        
        {/* Additional Meta Tags */}
        <meta name="keywords" content={`Bitcoin Cash, BCH, cryptocurrency, ${video.matched_keywords?.join(', ') || ''}`} />
        <link rel="canonical" content={videoUrl} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Video Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Video Player Area */}
              <div className="relative">
                {showVideo ? (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${video.video_id}?autoplay=1&rel=0&modestbranding=1`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div 
                    className="relative cursor-pointer group"
                    onClick={() => setShowVideo(true)}
                  >
                    <img
                      src={video.thumbnail_url || '/api/placeholder/800/450'}
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-4 transform group-hover:scale-110 transition-transform">
                        <Play className="h-12 w-12 text-[#16a085]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {video.title}
                </h1>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{formatNumber(video.view_count)} views</span>
                    {video.publish_date && (
                      <span>{formatDate(video.publish_date)}</span>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShareButtons(!showShareButtons)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Share Buttons */}
                {showShareButtons && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <SocialShareButtons
                      url={videoUrl}
                      title={shareTitle}
                      description={shareDescription}
                      hashtags={['BitcoinCash', 'BCH', 'cryptocurrency']}
                      via="BCHContentHub"
                    />
                  </div>
                )}

                {/* Description */}
                {video.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {video.description}
                    </p>
                  </div>
                )}

                {/* Keywords */}
                {video.matched_keywords && video.matched_keywords.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {video.matched_keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-block bg-[#16a085]/10 text-[#16a085] text-sm px-3 py-1 rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About BCH Content Hub</h3>
              <p className="text-gray-700 mb-4">
                Your centralized platform for Bitcoin Cash content from across the web. 
                Discover, curate, and stay updated with the latest BCH news, analysis, and education.
              </p>
              
              <div className="space-y-3">
                <Button 
                  className="w-full bg-[#16a085] hover:bg-[#0e7a6b]"
                  onClick={() => window.location.href = '/videos'}
                >
                  Explore More Videos
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`https://youtube.com/watch?v=${video.video_id}`, '_blank')}
                >
                  View on YouTube
                </Button>
              </div>
            </div>

            {/* Share Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share This Video</h3>
              <SocialShareButtons
                url={videoUrl}
                title={shareTitle}
                description={shareDescription}
                hashtags={['BitcoinCash', 'BCH', 'cryptocurrency']}
                via="BCHContentHub"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}