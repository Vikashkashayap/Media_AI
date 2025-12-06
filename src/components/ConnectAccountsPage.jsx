import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../contexts/WorkspaceContext';
import {
  connectSocialMediaAccount,
  listSocialMediaConnections,
  disconnectSocialMediaAccount,
  initiateOAuthFlow,
} from '../services/socialMediaService';

// Platform icons
function PersonalWebsiteIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

const PLATFORMS = [
  {
    id: 'PERSONAL_WEBSITE',
    name: 'Personal Website',
    description: 'Publish to your own blog or website',
    icon: PersonalWebsiteIcon,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'INSTAGRAM',
    name: 'Instagram',
    description: 'Share photos, videos, and stories',
    icon: InstagramIcon,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'FACEBOOK',
    name: 'Facebook',
    description: 'Post to your timeline and pages',
    icon: FacebookIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'TWITTER',
    name: 'Twitter / X',
    description: 'Share tweets and threads',
    icon: TwitterIcon,
    color: 'text-black',
    bgColor: 'bg-gray-50',
  },
  {
    id: 'LINKEDIN',
    name: 'LinkedIn',
    description: 'Professional posts and articles',
    icon: LinkedInIcon,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'YOUTUBE',
    name: 'YouTube',
    description: 'Upload videos and shorts',
    icon: YouTubeIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
];

// Platforms that use OAuth
const OAUTH_PLATFORMS = ['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN', 'YOUTUBE'];

export default function ConnectAccountsPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  // If workspaceId is missing from URL but we have activeWorkspaceId, redirect to correct URL
  useEffect(() => {
    if (!workspaceId && activeWorkspaceId) {
      const errorParam = searchParams.get('error');
      const successParam = searchParams.get('success');
      const platformParam = searchParams.get('platform');
      
      // Build new URL with workspaceId
      const params = new URLSearchParams();
      if (errorParam) params.set('error', errorParam);
      if (successParam) params.set('success', successParam);
      if (platformParam) params.set('platform', platformParam);
      
      const newUrl = `/workspaces/${activeWorkspaceId}/connect-accounts${params.toString() ? '?' + params.toString() : ''}`;
      navigate(newUrl, { replace: true });
      return;
    }
  }, [workspaceId, activeWorkspaceId, navigate, searchParams]);

  useEffect(() => {
    if (workspaceId) {
      loadConnections();
    }
  }, [workspaceId]);

  // Check for OAuth callback results
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    const platformParam = searchParams.get('platform');

    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam);
      setError(decodedError);
      // Don't clear params immediately, let user see the error
      // setSearchParams({}, { replace: true });
      
      // If it's invalid_state error, provide helpful message with retry option
      if (decodedError === 'invalid_state') {
        setError('OAuth connection failed. The session may have expired. Please try connecting again. If the problem persists, try clearing your browser cache and cookies.');
      }
    } else if (successParam && platformParam) {
      setSuccess(`${platformParam} account connected successfully!`);
      setSearchParams({}, { replace: true });
      loadConnections();
    }
  }, [searchParams, setSearchParams]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await listSocialMediaConnections();
      setConnections(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform) => {
    // Check if platform uses OAuth
    if (OAUTH_PLATFORMS.includes(platform.id)) {
      try {
        setConnecting(platform.id);
        setError('');
        
        // Initiate OAuth flow
        const response = await initiateOAuthFlow(platform.id.toLowerCase());
        
        // Redirect to OAuth provider
        window.location.href = response.authUrl;
      } catch (err) {
        setError(err.message || 'Failed to initiate OAuth flow');
        setConnecting(null);
      }
    } else {
      // For Personal Website, show manual entry modal
      setSelectedPlatform(platform);
      setShowConnectModal(true);
    }
  };

  const handleDisconnect = async (connectionId) => {
    if (!window.confirm('Are you sure you want to disconnect this account?')) {
      return;
    }
    try {
      await disconnectSocialMediaAccount(connectionId);
      await loadConnections();
    } catch (err) {
      setError(err.message || 'Failed to disconnect account');
    }
  };

  const handleConnectSubmit = async (credentials) => {
    try {
      setConnecting(selectedPlatform.id);
      setError('');
      
      await connectSocialMediaAccount({
        platform: selectedPlatform.id,
        credentials,
        metadata: {
          accountName: credentials.accountName || selectedPlatform.name,
        },
      });
      
      setShowConnectModal(false);
      setSelectedPlatform(null);
      await loadConnections();
    } catch (err) {
      setError(err.message || 'Failed to connect account');
    } finally {
      setConnecting(null);
    }
  };

  const getConnectionForPlatform = (platformId) => {
    return connections.find((conn) => conn.platform === platformId);
  };

  const isConnected = (platformId) => {
    const conn = getConnectionForPlatform(platformId);
    return conn && conn.status === 'CONNECTED';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon />
            <span className="ml-2">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Connect Your Accounts</h1>
          <p className="text-gray-600 mt-2">
            Link your personal social media accounts to publish content everywhere instantly
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading connections...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const connection = getConnectionForPlatform(platform.id);
              const connected = isConnected(platform.id);

              return (
                <div
                  key={platform.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`${platform.bgColor} p-3 rounded-lg`}>
                        {platform.gradient ? (
                          <div className={`bg-gradient-to-br ${platform.gradient} p-1 rounded`}>
                            <Icon />
                          </div>
                        ) : (
                          <div className={platform.color}>
                            <Icon />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {platform.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {platform.description}
                        </p>
                        {connected && connection?.metadata?.accountName && (
                          <p className="text-xs text-gray-500 mt-1">
                            Connected as: {connection.metadata.accountName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {connected ? (
                        <button
                          onClick={() => handleDisconnect(connection.id)}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(platform)}
                          disabled={connecting === platform.id}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {connecting === platform.id ? 'Connecting...' : '+ Connect'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && selectedPlatform && (
        <ConnectModal
          platform={selectedPlatform}
          onClose={() => {
            setShowConnectModal(false);
            setSelectedPlatform(null);
          }}
          onSubmit={handleConnectSubmit}
          isSubmitting={connecting === selectedPlatform.id}
        />
      )}
    </div>
  );
}

function ConnectModal({ platform, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderFormFields = () => {
    switch (platform.id) {
      case 'PERSONAL_WEBSITE':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                required
                value={formData.webhookUrl || ''}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://yourwebsite.com/webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key / Secret Token
              </label>
              <input
                type="password"
                required
                value={formData.apiKey || ''}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your API key"
              />
            </div>
          </>
        );
      
      case 'INSTAGRAM':
      case 'FACEBOOK':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <input
                type="password"
                required
                value={formData.accessToken || ''}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter OAuth access token"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name (optional)
              </label>
              <input
                type="text"
                value={formData.accountName || ''}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your account name"
              />
            </div>
          </>
        );
      
      case 'TWITTER':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bearer Token
              </label>
              <input
                type="password"
                required
                value={formData.bearerToken || ''}
                onChange={(e) => setFormData({ ...formData, bearerToken: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Twitter Bearer Token"
              />
            </div>
          </>
        );
      
      case 'LINKEDIN':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <input
                type="password"
                required
                value={formData.accessToken || ''}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter LinkedIn OAuth access token"
              />
            </div>
          </>
        );
      
      case 'YOUTUBE':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <input
                type="password"
                required
                value={formData.accessToken || ''}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter YouTube OAuth access token"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refresh Token
              </label>
              <input
                type="password"
                value={formData.refreshToken || ''}
                onChange={(e) => setFormData({ ...formData, refreshToken: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter refresh token (optional)"
              />
            </div>
          </>
        );
      
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credentials (JSON)
            </label>
            <textarea
              required
              value={formData.credentials || ''}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData({ ...formData, ...parsed });
                } catch {
                  setFormData({ ...formData, rawCredentials: e.target.value });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder='{"key": "value"}'
            />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Connect {platform.name}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFormFields()}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

