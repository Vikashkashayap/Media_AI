import { useState, useEffect } from 'react';

const PLATFORM_OPTIONS = [
  { value: 'WORDPRESS', label: 'WordPress' },
  { value: 'MERN', label: 'MERN' },
  { value: 'CUSTOM', label: 'Custom' },
];

export default function EditWebsiteModal({ isOpen, onClose, onUpdate, isSubmitting, website }) {
  const [form, setForm] = useState({
    platform: 'WORDPRESS',
    name: '',
    url: '',
    username: '',
    applicationPassword: '',
    webhookUrl: '',
    secretToken: '',
    token: '',
  });
  const [error, setError] = useState('');

  // Initialize form when website changes
  useEffect(() => {
    if (website) {
      setForm({
        platform: website.platform || 'WORDPRESS',
        name: website.name || '',
        url: website.url || '',
        username: website.credentials?.username || '',
        applicationPassword: '', // Don't prefill password for security
        webhookUrl: website.credentials?.webhookUrl || '',
        secretToken: '', // Don't prefill secret for security
        token: website.credentials?.token || '',
      });
    }
  }, [website]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) {
      setError('Site name and URL are required');
      return;
    }

    // If platform changed, require new credentials
    const platformChanged = form.platform !== website?.platform;
    if (platformChanged) {
      if (form.platform === 'WORDPRESS') {
        if (!form.username.trim() || !form.applicationPassword.trim()) {
          setError('Username and Application Password are required when changing platform');
          return;
        }
      } else if (form.platform === 'MERN') {
        if (!form.webhookUrl.trim() || !form.token.trim()) {
          setError('Webhook URL and Token are required when changing platform');
          return;
        }
      } else {
        if (!form.webhookUrl.trim() || !form.secretToken.trim()) {
          setError('Webhook URL and Secret Token are required when changing platform');
          return;
        }
      }
    }

    setError('');

    const payload = {
      name: form.name.trim(),
      url: form.url.trim(),
    };

    // Only include platform if it changed
    if (platformChanged) {
      payload.platform = form.platform;
    }

    // Build credentials payload
    // If platform changed, use new credentials
    // If platform didn't change, only include credentials if they were updated (non-empty)
    if (form.platform === 'WORDPRESS') {
      const username = form.username.trim() || (platformChanged ? '' : website?.credentials?.username);
      const applicationPassword = form.applicationPassword.trim() || (platformChanged ? '' : website?.credentials?.applicationPassword);
      
      if (platformChanged || form.username.trim() || form.applicationPassword.trim()) {
        payload.credentials = {
          username,
          applicationPassword,
        };
      }
    } else if (form.platform === 'MERN') {
      const webhookUrl = form.webhookUrl.trim() || (platformChanged ? '' : website?.credentials?.webhookUrl);
      const token = form.token.trim() || (platformChanged ? '' : website?.credentials?.token);
      
      if (platformChanged || form.webhookUrl.trim() || form.token.trim()) {
        payload.credentials = {
          webhookUrl,
          token,
        };
      }
    } else {
      const webhookUrl = form.webhookUrl.trim() || (platformChanged ? '' : website?.credentials?.webhookUrl);
      const secretToken = form.secretToken.trim() || (platformChanged ? '' : website?.credentials?.secretToken);
      
      if (platformChanged || form.webhookUrl.trim() || form.secretToken.trim()) {
        payload.credentials = {
          webhookUrl,
          secretToken,
        };
      }
    }

    try {
      await onUpdate(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update website');
    }
  };

  if (!isOpen || !website) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Edit Website</h3>
            <p className="text-xs text-gray-500 mt-0.5">Update website connection details</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Site Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="My Company Blog"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Site URL</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => handleChange('url', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Platform</label>
            <select
              value={form.platform}
              onChange={(e) => handleChange('platform', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {PLATFORM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Leave credentials empty to keep existing values</p>
          </div>

          {form.platform === 'WORDPRESS' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={website.credentials?.username ? `Current: ${website.credentials.username}` : 'WP admin username'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Application Password</label>
                <input
                  type="password"
                  value={form.applicationPassword}
                  onChange={(e) => handleChange('applicationPassword', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Leave empty to keep current"
                />
              </div>
            </div>
          ) : form.platform === 'MERN' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Webhook URL</label>
                <input
                  type="url"
                  value={form.webhookUrl}
                  onChange={(e) => handleChange('webhookUrl', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={website.credentials?.webhookUrl || 'https://example.com/api/utkrist/publish-blog'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Access Token</label>
                <input
                  type="text"
                  value={form.token}
                  onChange={(e) => handleChange('token', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Leave empty to keep current"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Webhook URL</label>
                <input
                  type="url"
                  value={form.webhookUrl}
                  onChange={(e) => handleChange('webhookUrl', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={website.credentials?.webhookUrl || 'https://example.com/api/utkrist/publish-blog'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Secret Token</label>
                <input
                  type="text"
                  value={form.secretToken}
                  onChange={(e) => handleChange('secretToken', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Leave empty to keep current"
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow disabled:opacity-60"
            >
              {isSubmitting ? 'Updating...' : 'Update Website'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

