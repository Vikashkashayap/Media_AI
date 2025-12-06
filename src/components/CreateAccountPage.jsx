import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    termsAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!formData.termsAccepted) {
      setError('Please accept the Terms and Conditions');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      // Navigate to chat or dashboard after successful registration
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="w-full max-w-[900px] h-auto min-h-[400px] sm:h-[550px] rounded-2xl sm:rounded-3xl shadow-2xl border border-black/5 overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-white">
        {/* LEFT: Sign up form */}
        <div className="relative h-full p-5 sm:p-6 md:p-7">
          {/* soft blobs for depth */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-300/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl" />

          {/* brand */}
          <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
            <span className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow" />
            <span className="font-semibold tracking-wide text-neutral-800 text-sm sm:text-base">AICreator</span>
          </div>

          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl text-neutral-900 mb-4 sm:mb-5">Create your account</h1>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
                className="w-full h-10 rounded-md border border-black/10 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
              />
            </div>
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email Address"
                required
                className="w-full h-10 rounded-md border border-black/10 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
              />
            </div>
            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                required
                minLength={6}
                className="w-full h-10 rounded-md border border-black/10 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="terms"
                name="termsAccepted"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="h-4 w-4 rounded border-neutral-300"
                required
              />
              <label htmlFor="terms" className="text-xs text-neutral-600">
                Accept the <a className="underline hover:no-underline" href="#">Terms and Conditions</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-neutral-500">Or login with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="h-10 rounded-md border border-neutral-200 bg-white text-sm font-medium hover:bg-neutral-50 flex items-center justify-center gap-2">
                {/* Google icon */}
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.6 3.5-5.1 3.5a5.3 5.3 0 1 1 0-10.6c1.5 0 2.6.6 3.2 1.2l2.2-2.2C16.4 4.7 14.4 4 12 4 6.9 4 2.8 8.1 2.8 13.2S6.9 22.4 12 22.4c6.2 0 8.6-4.4 8.6-6.7 0-.5-.1-.8-.1-1.1H12z"/>
                </svg>
                Sign in with Google
              </button>
              <button type="button" className="h-10 rounded-md border border-neutral-200 bg-white text-sm font-medium hover:bg-neutral-50 flex items-center justify-center gap-2">
                {/* Apple icon */}
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path d="M16.3 1.5c.1 1-.4 2-.9 2.6-.6.7-1.7 1.3-2.6 1.2-.1-1 .4-2 .9-2.6C14.3 2 15.4 1.4 16.3 1.5zM20.6 17.4c-.4.9-.6 1.3-1.2 2.1-.8 1.2-1.8 2.6-3.2 2.6-1.2 0-1.6-.8-3-.8-1.5 0-1.9.8-3 .8-1.4 0-2.4-1.3-3.2-2.5-2.2-3.4-2.4-7.4-1.1-9.5.9-1.5 2.3-2.3 3.6-2.3 1.3 0 2.2.8 3 .8.8 0 1.9-.9 3.3-.8 1.1.1 2.2.6 3 1.5-2.5 1.4-2.1 5 0 6.1-.2.6-.4 1.1-.6 1.8z" fill="currentColor"/>
                </svg>
                Sign in with Apple
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Already have an account? <Link to="/login" className="font-medium text-neutral-700">Log in</Link>
            </p>
          </form>
        </div>

        {/* RIGHT: Visual / CTA - Hidden on mobile */}
        <div className="hidden md:block relative h-full p-4 sm:p-6 grid place-items-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#c7a6ff] via-[#b995ff] to-[#9b8cff]" />
          {/* big dreamy orb */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {/* big sunset core */}
            <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(255,184,77,0.95),rgba(255,184,77,0))] blur-xl" />
            {/* green aura ring */}
            <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 h-[680px] w-[680px] rounded-full bg-[radial-gradient(closest-side,rgba(167,243,208,0.45),rgba(167,243,208,0))] blur-[60px] mix-blend-screen" />
            {/* magenta haze */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(closest-side,rgba(236,72,153,0.45),rgba(236,72,153,0))] blur-[40px]" />
            {/* bottom white bloom */}
            <div className="absolute left-1/2 bottom-4 -translate-x-1/2 h-[360px] w-[360px] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.9),rgba(255,255,255,0))] blur-2xl" />
            {/* subtle vignette */}
            <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_60%,rgba(0,0,0,0.15)_100%)] pointer-events-none" />
          </div>

          {/* glass input */}
          <div className="relative z-10 w-full flex justify-center">
            <div className="flex items-center w-[70%] max-w-xl rounded-full bg-amber-200/80 backdrop-blur-sm px-5 py-3 shadow-lg border border-white/40">
              <input
                placeholder="Create my next idea"
                className="flex-1 bg-transparent text-sm text-neutral-800 placeholder-neutral-600 outline-none"
              />
              <button
                className="h-8 w-8 rounded-full bg-neutral-900 text-white grid place-items-center text-xs"
                aria-label="Go"
              >
                ↑
              </button>
            </div>
          </div>

          {/* footer text */}
          <div className="absolute bottom-8 sm:bottom-14 left-0 right-0 z-10 text-center px-4">
            <p className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/95 drop-shadow-sm">
              Your creations are waiting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
