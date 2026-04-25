import React, { useState } from 'react';
import { Copy, X } from 'lucide-react';

export function ShareModal({ isOpen, onClose, shareId, questionText }) {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/q/${shareId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `🧠 Can you answer this question?\n\n${questionText}\n\nSubmit your answer here 👇\n${shareUrl}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = `Think you know the answer? 🤔\n${questionText}\n#Questly\n${shareUrl}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
  };

  const handleFacebookShare = () => {
    const encodedUrl = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-navy-900 border border-teal-400 border-opacity-20 rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Share This Question</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Link */}
        <div className="mb-6">
          <div className="bg-navy-800 border border-navy-600 rounded-lg p-3 flex items-center justify-between">
            <div className="flex-1 truncate mr-3">
              <span className="text-teal-400 font-mono text-sm truncate">
                {shareUrl}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="text-teal-400 hover:text-teal-300 transition-colors flex-shrink-0"
              title={copied ? "Copied!" : "Copy link"}
            >
              {copied ? (
                <span className="text-green-400">✅ Copied!</span>
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleWhatsAppShare}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleTwitterShare}
            className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-3.295 16.562h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>Twitter</span>
          </button>

          <button
            onClick={handleFacebookShare}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="bg-navy-800 border border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-navy-900 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Copy className="w-5 h-5" />
            <span>Copy</span>
          </button>
        </div>

        {/* Close Button */}
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
