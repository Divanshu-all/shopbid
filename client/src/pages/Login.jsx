import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { FiMail, FiLock, FiArrowRight, FiShoppingBag, FiEye, FiEyeOff } from 'react-icons/fi';

/* ─── Google icon SVG ─────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ─── Floating orb ────────────────────────────────────────────────── */
const Orb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />
);

export default function Login() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, googleLogin }  = useAuth();
  const navigate                = useNavigate();

  /* ── Email / password submit ──────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('All fields required');
    setLoading(true);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.success) {
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate(res.user.role === 'shopkeeper' ? '/dashboard' : '/browse');
    } else toast.error(res.message);
  };

  /* ── Google OAuth ─────────────────────────────────────────────── */
  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      // Exchange access token for user info, then send to backend
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await userInfoRes.json();
      const res = await googleLogin(userInfo);
      setGLoading(false);
      if (res.success) {
        toast.success(`Welcome, ${res.user.name}!`);
        navigate(res.user.role === 'shopkeeper' ? '/dashboard' : '/browse');
      } else toast.error(res.message || 'Google sign-in failed');
    },
    onError: () => {
      setGLoading(false);
      toast.error('Google sign-in cancelled');
    },
  });

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-hidden">

      {/* ── Hero / top section ────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-5 pt-12 pb-20 overflow-hidden">
        {/* Decorative orbs */}
        <Orb className="w-72 h-72 bg-blue-400/30 -top-20 -right-16" />
        <Orb className="w-48 h-48 bg-blue-800/40 bottom-0 -left-12" />
        <Orb className="w-32 h-32 bg-white/10 top-8 right-1/3" />

        {/* Grid texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 max-w-md mx-auto">
          {/* Logo badge */}
          <div className="w-14 h-14 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl
                          flex items-center justify-center mb-6 shadow-lg shadow-blue-900/30">
            <FiShoppingBag className="text-white text-2xl" />
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-2">
            Welcome<br />
            <span className="text-blue-200">back.</span>
          </h1>
          <p className="text-blue-200/80 text-sm tracking-wide">
            Sign in to continue to ShopBid
          </p>
        </div>
      </div>

      {/* ── Form card ─────────────────────────────────────────────── */}
      <div className="flex-1 bg-white rounded-t-[2rem] -mt-8 relative z-10
                      shadow-[0_-8px_40px_rgba(37,99,235,0.12)] px-5 pt-8 pb-10">
        <div className="max-w-md mx-auto">

          {/* ── Google button ─────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => handleGoogle()}
            disabled={gLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 mb-5
                       bg-white border-2 border-slate-200 hover:border-blue-400
                       hover:bg-blue-50/50 rounded-2xl transition-all duration-200
                       text-slate-700 font-semibold text-sm shadow-sm
                       disabled:opacity-60 disabled:cursor-not-allowed
                       active:scale-[0.98]"
          >
            {gLoading ? (
              <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
            ) : <GoogleIcon />}
            <span>{gLoading ? 'Connecting…' : 'Continue with Google'}</span>
          </button>

          {/* ── Divider ───────────────────────────────────────────── */}
          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* ── Email / password form ─────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400
                                   group-focus-within:text-blue-500 transition-colors" />
                <input
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-200
                             bg-slate-50 text-slate-800 placeholder-slate-400 text-sm
                             focus:outline-none focus:border-blue-500 focus:bg-white
                             transition-all duration-200"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400
                                   group-focus-within:text-blue-500 transition-colors" />
                <input
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl border-2 border-slate-200
                             bg-slate-50 text-slate-800 placeholder-slate-400 text-sm
                             focus:outline-none focus:border-blue-500 focus:bg-white
                             transition-all duration-200"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400
                             hover:text-blue-500 transition-colors"
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password"
                  className="text-xs text-blue-500 font-semibold hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || gLoading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl mt-1
                         bg-gradient-to-r from-blue-600 to-blue-500
                         hover:from-blue-700 hover:to-blue-600
                         active:scale-[0.98] text-white font-bold text-sm
                         shadow-lg shadow-blue-500/30
                         transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  <span>Logging in…</span>
                </>
              ) : (
                <>
                  <span>Log In</span>
                  <FiArrowRight className="text-blue-200" />
                </>
              )}
            </button>
          </form>

          {/* ── Footer ────────────────────────────────────────────── */}
          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register"
              className="text-blue-600 font-bold hover:text-blue-800 transition-colors">
              Sign up free
            </Link>
          </p>

          {/* ── Trust badges ──────────────────────────────────────── */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-5">
            {['🔒 Secure', '⚡ Fast', '✓ Trusted'].map(badge => (
              <span key={badge} className="text-xs text-slate-400 font-medium">{badge}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
