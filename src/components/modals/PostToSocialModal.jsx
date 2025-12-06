import { useState, useEffect } from 'react';
import { listSocialMediaConnections, postImageToSocialMedia } from '../../services/socialMediaService';

function FacebookIcon() {
  return (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function getPlatformIcon(platform) {
  switch (platform) {
    case 'FACEBOOK':
      return FacebookIcon;
    case 'INSTAGRAM':
      return InstagramIcon;
    case 'TWITTER':
      return TwitterIcon;
    case 'LINKEDIN':
      return LinkedInIcon;
    case 'YOUTUBE':
      return YouTubeIcon;
    default:
      return null;
  }
}

function getPlatformName(platform) {
  const names = {
    FACEBOOK: 'Facebook',
    INSTAGRAM: 'Instagram',
    TWITTER: 'Twitter',
    LINKEDIN: 'LinkedIn',
    YOUTUBE: 'YouTube',
    PERSONAL_WEBSITE: 'Personal Website',
  };
  return names[platform] || platform;
}

export default function PostToSocialModal({ isOpen, onClose, imageUrl, prompt }) {
  const [connections, setConnections] = useState([]);
  const [selectedConnections, setSelectedConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [postedTo, setPostedTo] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadConnections();
    }
  }, [isOpen]);

  const loadConnections = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listSocialMediaConnections();
      // Filter to only CONNECTED accounts
      const connected = data.filter((conn) => conn.status === 'CONNECTED');
      setConnections(connected);
      // Select all by default
      setSelectedConnections(connected.map((c) => c.id));
    } catch (err) {
      setError(err.message || 'Failed to load social media connections');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConnection = (connectionId) => {
    setSelectedConnections((prev) =>
      prev.includes(connectionId)
        ? prev.filter((id) => id !== connectionId)
        : [...prev, connectionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedConnections.length === connections.length) {
      setSelectedConnections([]);
    } else {
      setSelectedConnections(connections.map((c) => c.id));
    }
  };

  const handlePost = async () => {
    if (selectedConnections.length === 0) {
      setError('Please select at least one account to post to');
      return;
    }

    setPosting(true);
    setError('');
    setSuccess(false);

    try {
      const result = await postImageToSocialMedia({
        imageUrl,
        prompt,
        connectionIds: selectedConnections,
      });

      setSuccess(true);
      setPostedTo(result.postedTo || []);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setPostedTo([]);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to post to social media');
    } finally {
      setPosting(false);
    }
  };

  if (!isOpen) return null;

  const getPlatformColor = (platform) => {
    const colors = {
      FACEBOOK: 'from-blue-500 to-blue-600',
      INSTAGRAM: 'from-purple-500 to-pink-500',
      TWITTER: 'from-blue-400 to-blue-500',
      LINKEDIN: 'from-blue-600 to-blue-700',
      YOUTUBE: 'from-red-500 to-red-600',
      PERSONAL_WEBSITE: 'from-gray-500 to-gray-600',
    };
    return colors[platform] || 'from-gray-500 to-gray-600';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Post to Social Media</h2>
                <p className="text-sm text-gray-300 mt-0.5">
                  Share your image across multiple platforms
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-all text-gray-300 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-3"></div>
              <p className="text-gray-300 font-medium">Loading connections...</p>
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-200 font-medium mb-2">No connected accounts</p>
              <p className="text-sm text-gray-400">
                Connect social media accounts in workspace settings to get started.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-300">
                  Select accounts to post to{' '}
                  <span className="text-cyan-400 font-semibold">
                    ({selectedConnections.length} selected)
                  </span>
                </p>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold hover:underline transition-all"
                >
                  {selectedConnections.length === connections.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-3">
                {connections.map((connection) => {
                  const Icon = getPlatformIcon(connection.platform);
                  const isSelected = selectedConnections.includes(connection.id);
                  const platformColor = getPlatformColor(connection.platform);
                  
                  return (
                    <label
                      key={connection.id}
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'border-cyan-500 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-md shadow-cyan-500/20'
                          : 'border-gray-700 hover:border-gray-600 hover:shadow-sm bg-gray-800'
                      }`}
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleConnection(connection.id)}
                          className="w-5 h-5 text-cyan-500 rounded focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
                        />
                      </div>
                      <div className="ml-4 flex items-center flex-1 min-w-0">
                        {Icon && (
                          <div className={`mr-4 p-2.5 rounded-xl bg-gradient-to-r ${platformColor} flex-shrink-0 shadow-sm`}>
                            <Icon />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            {getPlatformName(connection.platform)}
                          </p>
                          {connection.metadata?.accountName && (
                            <p className="text-sm text-gray-400 mt-0.5 truncate">
                              {connection.metadata.accountName}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="ml-3 flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-300 font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-500/20 border-l-4 border-green-500 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-green-300 font-semibold mb-2">
                    Successfully posted to:
                  </p>
                  <ul className="text-sm text-green-400 space-y-1">
                    {postedTo.map((account, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        {account}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={posting}
            className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-xl transition-all disabled:opacity-50 border border-gray-600 shadow-sm hover:shadow"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={posting || selectedConnections.length === 0 || connections.length === 0}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-cyan-500/30 disabled:shadow-none flex items-center gap-2"
          >
            {posting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Posting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Post to {selectedConnections.length} Account{selectedConnections.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


