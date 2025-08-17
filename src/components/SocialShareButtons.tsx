import React, { useState } from 'react'
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  TelegramIcon,
  WhatsappIcon
} from 'react-share'
import { Copy, Check, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SocialShareButtonsProps {
  url: string
  title: string
  description?: string
  hashtags?: string[]
  via?: string
  size?: 'small' | 'medium' | 'large'
  layout?: 'horizontal' | 'vertical'
  className?: string
}

export function SocialShareButtons({
  url,
  title,
  description,
  hashtags = [],
  via = 'BCHContentHub',
  size = 'medium',
  layout = 'horizontal',
  className = ''
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const iconSize = {
    small: 32,
    medium: 40,
    large: 48
  }[size]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const shareData = {
    url,
    title,
    hashtags,
    via
  }

  const containerClass = layout === 'vertical' 
    ? 'flex flex-col space-y-3' 
    : 'flex flex-wrap items-center gap-3'

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Social Media Buttons */}
      <div className={layout === 'vertical' ? 'flex flex-col space-y-2' : 'flex items-center space-x-2'}>
        {/* Twitter/X */}
        <TwitterShareButton
          url={shareData.url}
          title={shareData.title}
          hashtags={shareData.hashtags}
          via={shareData.via}
          className="hover:opacity-80 transition-opacity"
        >
          <TwitterIcon size={iconSize} round />
        </TwitterShareButton>

        {/* Facebook */}
        <FacebookShareButton
          url={shareData.url}
          hashtag={`#${shareData.hashtags[0] || 'BitcoinCash'}`}
          className="hover:opacity-80 transition-opacity"
        >
          <FacebookIcon size={iconSize} round />
        </FacebookShareButton>

        {/* LinkedIn */}
        <LinkedinShareButton
          url={shareData.url}
          title={shareData.title}
          summary={description}
          source="BCH Content Hub"
          className="hover:opacity-80 transition-opacity"
        >
          <LinkedinIcon size={iconSize} round />
        </LinkedinShareButton>

        {/* Telegram */}
        <TelegramShareButton
          url={shareData.url}
          title={shareData.title}
          className="hover:opacity-80 transition-opacity"
        >
          <TelegramIcon size={iconSize} round />
        </TelegramShareButton>

        {/* WhatsApp */}
        <WhatsappShareButton
          url={shareData.url}
          title={shareData.title}
          separator=" - "
          className="hover:opacity-80 transition-opacity"
        >
          <WhatsappIcon size={iconSize} round />
        </WhatsappShareButton>
      </div>

      {/* Copy Link Button */}
      <Button
        variant="outline"
        size={size === 'small' ? 'sm' : 'default'}
        onClick={copyToClipboard}
        className={`flex items-center space-x-2 ${
          copied ? 'bg-green-50 border-green-200 text-green-700' : 'hover:bg-gray-50'
        }`}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span>Copy Link</span>
          </>
        )}
      </Button>
    </div>
  )
}

// Compact version for use in video cards
export function CompactShareButtons({
  url,
  title,
  description,
  hashtags = ['BitcoinCash', 'BCH'],
  className = ''
}: Omit<SocialShareButtonsProps, 'size' | 'layout'>) {
  const [showFullShare, setShowFullShare] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  if (showFullShare) {
    return (
      <div className={`p-3 bg-white border rounded-lg shadow-lg ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Share this video</span>
          <button
            onClick={() => setShowFullShare(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <SocialShareButtons
          url={url}
          title={title}
          description={description}
          hashtags={hashtags}
          size="small"
          layout="horizontal"
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowFullShare(true)}
        className="text-gray-600 hover:text-gray-800"
      >
        <Share2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className={`text-gray-600 hover:text-gray-800 ${
          copied ? 'text-green-600' : ''
        }`}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}