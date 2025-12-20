import React, { useState } from 'react';
import { X, Copy, Check, Link, Twitter, Facebook, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;
  const shareText = "Help me choose which tracks make the WhoIsLu album! Vote for your favorites on Neon Pink Flames 🔥";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#1a0a1f] to-[#0a0a0f] border border-pink-500/30 rounded-2xl shadow-2xl shadow-pink-500/20 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <Link className="w-5 h-5 text-pink-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Share Voting Link</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Copy link */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Voting Link</label>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-lg text-gray-300 text-sm truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-pink-500 hover:bg-pink-400 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social sharing */}
          <div>
            <label className="block text-gray-400 text-sm mb-3">Share on Social</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleTwitterShare}
                className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-[#1DA1F2]/20 border border-white/10 hover:border-[#1DA1F2]/50 rounded-xl transition-all group"
              >
                <Twitter className="w-6 h-6 text-gray-400 group-hover:text-[#1DA1F2]" />
                <span className="text-xs text-gray-500 group-hover:text-gray-300">Twitter</span>
              </button>
              <button
                onClick={handleFacebookShare}
                className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-[#4267B2]/20 border border-white/10 hover:border-[#4267B2]/50 rounded-xl transition-all group"
              >
                <Facebook className="w-6 h-6 text-gray-400 group-hover:text-[#4267B2]" />
                <span className="text-xs text-gray-500 group-hover:text-gray-300">Facebook</span>
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-[#25D366]/20 border border-white/10 hover:border-[#25D366]/50 rounded-xl transition-all group"
              >
                <MessageCircle className="w-6 h-6 text-gray-400 group-hover:text-[#25D366]" />
                <span className="text-xs text-gray-500 group-hover:text-gray-300">WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl">
            <p className="text-pink-300 text-sm">
              Share this link with friends and family. They'll enter their name and can vote for their favorite tracks!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;