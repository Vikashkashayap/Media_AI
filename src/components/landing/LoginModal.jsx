import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import Logo from './Logo';

export default function LoginModal({ onClose, onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const form = new FormData(e.currentTarget);
    const email = form.get('email');
    const password = form.get('password');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 to-gray-900/90" />

        <div className="relative p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <Logo linkTo={null} size="large" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome back</h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            Log in to continue creating ✨
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full h-11 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500 px-4 text-sm outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                  className="w-full h-11 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder:text-gray-500 px-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-600 bg-gray-700/50 text-cyan-500 focus:ring-cyan-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-300">
                Remember me
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gray-800 px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="h-11 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.6h5.1c-.2 1.2-1.6 3.5-5.1 3.5a5.3 5.3 0 1 1 0-10.6c1.5 0 2.6.6 3.2 1.2l2.2-2.2C16.4 4.7 14.4 4 12 4 6.9 4 2.8 8.1 2.8 13.2S6.9 22.4 12 22.4c6.2 0 8.6-4.4 8.6-6.7 0-.5-.1-.8-.1-1.1H12z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="h-11 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    d="M16.3 1.5c.1 1-.4 2-.9 2.6-.6.7-1.7 1.3-2.6 1.2-.1-1 .4-2 .9-2.6C14.3 2 15.4 1.4 16.3 1.5zM20.6 17.4c-.4.9-.6 1.3-1.2 2.1-.8 1.2-1.8 2.6-3.2 2.6-1.2 0-1.6-.8-3-.8-1.5 0-1.9.8-3 .8-1.4 0-2.4-1.3-3.2-2.5-2.2-3.4-2.4-7.4-1.1-9.5.9-1.5 2.3-2.3 3.6-2.3 1.3 0 2.2.8 3 .8.8 0 1.9-.9 3.3-.8 1.1.1 2.2.6 3 1.5-2.5 1.4-2.1 5 0 6.1-.2.6-.4 1.1-.6 1.8z"
                    fill="currentColor"
                  />
                </svg>
                Apple
              </button>
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-cyan-400 hover:text-cyan-300"
                onClick={onClose}
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

