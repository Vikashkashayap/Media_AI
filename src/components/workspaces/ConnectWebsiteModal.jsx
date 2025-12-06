import { useState } from 'react';

const PLATFORM_OPTIONS = [
  { value: 'WORDPRESS', label: 'WordPress' },
  { value: 'MERN', label: 'MERN' },
  { value: 'CUSTOM', label: 'Custom' },
];

export default function ConnectWebsiteModal({ isOpen, onClose, onConnect, isSubmitting, workspaceName }) {
  const [form, setForm] = useState({
    platform: 'WORDPRESS',
    name: '',
    url: '',
    username: '',
    applicationPassword: '',
    webhookUrl: '',
    secretToken: '',
    token: '',
    apiKey: '',
  });
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) {
      setError('Site name and URL are required');
      return;
    }
    setError('');

    const payload = {
      name: form.name.trim(),
      url: form.url.trim(),
      platform: form.platform,
      credentials: {},
    };

    if (form.platform === 'WORDPRESS') {
      payload.credentials = {
        username: form.username.trim(),
        applicationPassword: form.applicationPassword.trim(),
      };
    } else if (form.platform === 'MERN') {
      payload.credentials = {
        webhookUrl: form.webhookUrl.trim(),
        token: form.token.trim(),
      };
    } else {
      payload.credentials = {
        webhookUrl: form.webhookUrl.trim(),
        secretToken: form.secretToken.trim(),
      };
    }

    try {
      await onConnect(payload);
      onClose();
      setForm({
        platform: 'WORDPRESS',
        name: '',
        url: '',
        username: '',
        applicationPassword: '',
        webhookUrl: '',
        secretToken: '',
        token: '',
        apiKey: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to connect website');
    }
  };

  if (!isOpen) return null;
  

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Connect Website</h3>
            {workspaceName && (
              <p className="text-xs text-gray-400 mt-0.5">
                Finish setup for <span className="font-semibold text-cyan-400">{workspaceName}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Site Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="My Company Blog"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Site URL</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => handleChange('url', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => handleChange('platform', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              >
                {PLATFORM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">API Key (optional)</label>
              <input
                type="text"
                value={form.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="For future integrations"
              />
            </div>
          </div>

          {form.platform === 'WORDPRESS' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="WP admin username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Application Password</label>
                <input
                  type="password"
                  value={form.applicationPassword}
                  onChange={(e) => handleChange('applicationPassword', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Application password"
                />
              </div>
            </div>
          ) : form.platform === 'MERN' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Webhook URL</label>
                <input
                  type="url"
                  value={form.webhookUrl}
                  onChange={(e) => handleChange('webhookUrl', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="https://example.com/api/utkrist/publish-blog"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Access Token</label>
                <input
                  type="text"
                  value={form.token}
                  onChange={(e) => handleChange('token', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Bearer token for MERN webhook"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Webhook URL</label>
                <input
                  type="url"
                  value={form.webhookUrl}
                  onChange={(e) => handleChange('webhookUrl', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="https://example.com/api/utkrist/publish-blog"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Secret Token</label>
                <input
                  type="text"
                  value={form.secretToken}
                  onChange={(e) => handleChange('secretToken', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Used for HMAC signature"
                />
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg shadow-lg shadow-cyan-500/30 disabled:opacity-60 transition-all"
            >
              {isSubmitting ? 'Connecting...' : 'Connect Website'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
