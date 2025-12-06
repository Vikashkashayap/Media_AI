import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";

// React JavaScript version (no TypeScript types)
// Toggle between Login, Forgot Password, and Verify Email screens
export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // 'login' | 'forgot' | 'verify'
  const [lastEmail, setLastEmail] = useState("");

  // Simulated resend handler
  async function handleResend() {
    // TODO: Hook up to your backend: POST /api/auth/reset/resend { email: lastEmail }
    await new Promise((r) => setTimeout(r, 600));
    return true;
  }

  return (
    <div className="min-h-screen w-full bg-neutral-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="w-full max-w-[900px] h-auto min-h-[400px] sm:h-[550px] rounded-2xl sm:rounded-3xl shadow-2xl border border-black/5 overflow-hidden grid grid-cols-1 md:grid-cols-2 bg-white">
        {/* LEFT: Auth form */}
        <div className="relative h-full p-5 sm:p-6 md:p-7">
          {/* soft blobs for depth */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-300/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl" />

          {/* brand */}
          <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
            <span className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow" />
            <span className="font-semibold tracking-wide text-neutral-800 text-sm sm:text-base">AICreator</span>
          </div>

          {mode === "login" && <LoginForm onForgot={() => setMode("forgot")} onSuccess={() => navigate("/")} />}

          {mode === "forgot" && (
            <ForgotForm
              onBack={() => setMode("login")}
              onSent={(email) => {
                setLastEmail(String(email || ""));
                setMode("verify");
              }}
            />
          )}

          {mode === "verify" && (
            <VerifyEmail email={lastEmail} onBack={() => setMode("login")} onResend={handleResend} />
          )}
        </div>

        {/* RIGHT: Visual / CTA (same dreamy vibe) - Hidden on mobile */}
        <div className="hidden md:block">
          <RightVisual />
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onForgot, onSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      // Call onSuccess callback to navigate
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="font-serif text-xl sm:text-2xl md:text-3xl text-neutral-900 mb-1">Welcome back</h1>
      <p className="text-xs sm:text-sm text-neutral-600 mb-4 sm:mb-5">Log in to continue creating ✨</p>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={onSubmit}>
        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="w-full h-10 rounded-md border border-black/10 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-neutral-600" htmlFor="password">
              Password
            </label>
            {/* In Next.js real app: replace with <Link href="/forgot-password">Forgot password?</Link> */}
            <button
              type="button"
              onClick={onForgot}
              className="text-xs text-neutral-600 hover:text-neutral-800 underline underline-offset-2"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              autoComplete="current-password"
              required
              className="w-full h-10 rounded-md border border-black/10 bg-white/70 px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-600 hover:text-neutral-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input id="remember" name="remember" type="checkbox" className="h-4 w-4 rounded border-neutral-300" />
          <label htmlFor="remember" className="text-xs text-neutral-600">
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          aria-busy={loading}
        >
          {loading ? "Logging in…" : "Log in"}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-neutral-500">Or continue with</span>
          </div>
        </div>

        {/* Social login */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="h-10 rounded-md border border-neutral-200 bg-white text-sm font-medium hover:bg-neutral-50 flex items-center justify-center gap-2"
          >
            {/* Google icon */}
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 10.2v3.6h5.1c-.2 1.2-1.6 3.5-5.1 3.5a5.3 5.3 0 1 1 0-10.6c1.5 0 2.6.6 3.2 1.2l2.2-2.2C16.4 4.7 14.4 4 12 4 6.9 4 2.8 8.1 2.8 13.2S6.9 22.4 12 22.4c6.2 0 8.6-4.4 8.6-6.7 0-.5-.1-.8-.1-1.1H12z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="h-10 rounded-md border border-neutral-200 bg-white text-sm font-medium hover:bg-neutral-50 flex items-center justify-center gap-2"
          >
            {/* Apple icon */}
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                d="M16.3 1.5c.1 1-.4 2-.9 2.6-.6.7-1.7 1.3-2.6 1.2-.1-1 .4-2 .9-2.6C14.3 2 15.4 1.4 16.3 1.5zM20.6 17.4c-.4.9-.6 1.3-1.2 2.1-.8 1.2-1.8 2.6-3.2 2.6-1.2 0-1.6-.8-3-.8-1.5 0-1.9.8-3 .8-1.4 0-2.4-1.3-3.2-2.5-2.2-3.4-2.4-7.4-1.1-9.5.9-1.5 2.3-2.3 3.6-2.3 1.3 0 2.2.8 3 .8.8 0 1.9-.9 3.3-.8 1.1.1 2.2.6 3 1.5-2.5 1.4-2.1 5 0 6.1-.2.6-.4 1.1-.6 1.8z"
                fill="currentColor"
              />
            </svg>
            Apple
          </button>
        </div>

        <p className="text-xs text-neutral-500">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-neutral-700">
            Create one
          </Link>
        </p>
      </form>
    </>
  );
}

function ForgotForm({ onBack, onSent }) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    try {
      setLoading(true);
      // TODO: Call your API to send reset email, e.g. fetch('/api/auth/reset', { method: 'POST', body: JSON.stringify({ email }) })
      await new Promise((r) => setTimeout(r, 800)); // demo delay
      onSent(email);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="font-serif text-2xl md:text-3xl text-neutral-900 mb-2">Reset your password</h1>
      <p className="text-sm text-neutral-600 mb-5">Enter your email and we'll send you a reset link.</p>

      <form className="space-y-4" onSubmit={onSubmit}>
        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-2" htmlFor="reset-email">
            Email
          </label>
          <input
            id="reset-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="w-full h-10 rounded-md border border-black/10 bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
          />
          <p className="mt-2 text-xs text-neutral-500">We'll send a one-time secure link to reset your password.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          aria-busy={loading}
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>

        <div className="flex items-center justify-between text-xs">
          {/* In Next.js real app: replace with <Link href="/login">Back to log in</Link> */}
          <button type="button" onClick={onBack} className="text-neutral-600 hover:text-neutral-800 underline underline-offset-2">
            Back to log in
          </button>
          <a href="#" className="text-neutral-600 hover:text-neutral-800">
            Need help?
          </a>
        </div>
      </form>
    </>
  );
}

function VerifyEmail({ email, onBack, onResend }) {
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setLoading(true);
    const ok = await onResend();
    setLoading(false);
    if (ok) setResent(true);
  }

  return (
    <>
      <h1 className="font-serif text-2xl md:text-3xl text-neutral-900 mb-3">Verify your email</h1>
      <p className="text-sm text-neutral-600 mb-2">
        An email with instructions to verify your {email ? (<span className="font-medium text-neutral-800">{email}</span>) : "email address"} has been sent to you.
      </p>
      <p className="text-sm text-neutral-600 mb-4">Haven't received a verification code in your email?</p>

      <div className="space-y-4">
        <button
          type="button"
          onClick={handleResend}
          disabled={loading}
          className="w-full h-10 rounded-md border border-neutral-200 bg-white text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
        >
          {loading ? "Resending…" : "Resend Verification Email"}
        </button>

        {resent && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            A new verification email has been sent.
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          <button type="button" onClick={onBack} className="text-neutral-600 hover:text-neutral-800 underline underline-offset-2">
            Back to log in
          </button>
          <a href="#" className="text-neutral-600 hover:text-neutral-800">
            Open email app
          </a>
        </div>
      </div>
    </>
  );
}

function RightVisual() {
  return (
    <div className="relative h-full p-4 sm:p-6 grid place-items-center">
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
  );
}
