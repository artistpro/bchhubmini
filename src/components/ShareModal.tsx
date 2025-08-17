import React, { useState } from 'react';
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
} from 'react-share';
import { X, Copy, Check } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, videoUrl, title }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `Check out this amazing video: ${title} - BCH Content Hub`;
  const hashtags = ['BitcoinCash', 'BCH', 'Cryptocurrency'];

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close sharing modal"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Share Video</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{title}</p>
        </div>

        {/* Social Share Buttons */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Share on social media</h4>
          <div className="grid grid-cols-5 gap-3">
            <div className="flex flex-col items-center">
              <FacebookShareButton
                url={videoUrl}
                hashtag="#BitcoinCash"
                className="hover:scale-110 transition-transform"
              >
                <FacebookIcon size={40} round />
              </FacebookShareButton>
              <span className="text-xs text-gray-600 mt-1">Facebook</span>
            </div>

            <div className="flex flex-col items-center">
              <TwitterShareButton
                url={videoUrl}
                title={shareText}
                hashtags={hashtags}
                className="hover:scale-110 transition-transform"
              >
                <TwitterIcon size={40} round />
              </TwitterShareButton>
              <span className="text-xs text-gray-600 mt-1">Twitter</span>
            </div>

            <div className="flex flex-col items-center">
              <LinkedinShareButton
                url={videoUrl}
                title={title}
                summary={shareText}
                source="BCH Content Hub"
                className="hover:scale-110 transition-transform"
              >
                <LinkedinIcon size={40} round />
              </LinkedinShareButton>
              <span className="text-xs text-gray-600 mt-1">LinkedIn</span>
            </div>

            <div className="flex flex-col items-center">
              <TelegramShareButton
                url={videoUrl}
                title={shareText}
                className="hover:scale-110 transition-transform"
              >
                <TelegramIcon size={40} round />
              </TelegramShareButton>
              <span className="text-xs text-gray-600 mt-1">Telegram</span>
            </div>

            <div className="flex flex-col items-center">
              <WhatsappShareButton
                url={videoUrl}
                title={shareText}
                separator=" - "
                className="hover:scale-110 transition-transform"
              >
                <WhatsappIcon size={40} round />
              </WhatsappShareButton>
              <span className="text-xs text-gray-600 mt-1">WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Copy Link Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Copy link</h4>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={videoUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700"
            />
            <button
              onClick={handleCopyToClipboard}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                copied
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Help grow the BCH community by sharing great content!
        </div>
      </div>
    </div>
  );
};

export default ShareModal;