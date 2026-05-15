import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { FiUser, FiMail, FiLock, FiArrowRight, FiShoppingBag, FiShoppingCart, FiEye, FiEyeOff } from 'react-icons/fi';

/* ── Google icon ───────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Particle = ({ className }) => <div className={`register-particle ${className}`} />;

export default function Register() {
  const [params]  = useSearchParams();
  const [form, setForm]         = useState({ name: '', email: '', password: '', role: params.get('role') || 'buyer' });
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  /* ── Email / password submit ────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('All fields required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    const res = await register(form.name, form.email, form.password, form.role);
    setLoading(false);
    if (res.success) {
      toast.success('Welcome to ShopBid!');
      navigate(res.user.role === 'shopkeeper' ? '/shop/setup' : '/browse');
    } else toast.error(res.message);
  };

  /* ── Google OAuth ───────────────────────────────────────── */
  // Note: Google accounts are always created as 'buyer' by default.
  // The selected role card is ignored for Google sign-up since Google
  // doesn't provide a role — the user can change it later if needed.
  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true);
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        const res = await googleLogin(userInfo);
        if (res.success) {
          toast.success('Welcome to ShopBid!');
          navigate(res.user.role === 'shopkeeper' ? '/shop/setup' : '/browse');
        } else toast.error(res.message || 'Google sign-up failed');
      } catch {
        toast.error('Google sign-up failed');
      } finally {
        setGLoading(false);
      }
    },
    onError: () => {
      setGLoading(false);
      toast.error('Google sign-up cancelled');
    },
  });

  const strengthLevel  = Math.min(4, Math.floor(form.password.length / 3));
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="register-page">

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="register-hero">
        <div className="register-grid-texture" />
        <div className="register-ring-wrap-outer"><div className="register-ring-outer" /></div>
        <div className="register-ring-wrap-inner"><div className="register-ring-inner" /></div>
        <div className="register-pulse-ring register-pulse-ring--lg" />
        <div className="register-pulse-ring register-pulse-ring--sm" />
        <div className="register-blob register-blob--tr" />
        <div className="register-blob register-blob--bl" />
        <Particle className="register-particle--1" />
        <Particle className="register-particle--2" />
        <Particle className="register-particle--3" />
        <Particle className="register-particle--4" />
        <Particle className="register-particle--5" />
        <Particle className="register-particle--6" />

        <div className={`register-hero-content ${mounted ? 'register-hero-content--visible' : ''}`}>
          <div className="register-logo-badge">
            <div className="register-logo-border" />
            <div className="register-logo-inner">
              <FiShoppingBag className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="register-title">Join<br /><span className="register-title-accent">ShopBid.</span></h1>
          <p className="register-subtitle">Free forever. No card needed.</p>
        </div>
      </div>

      {/* ── Wave ──────────────────────────────────────────── */}
      <div className="register-wave-wrap">
        <svg viewBox="0 0 700 40" preserveAspectRatio="none" className="register-wave-svg">
          <path d="M0,10 Q175,30 350,10 T700,10 L700,40 L0,40 Z" fill="white" />
        </svg>
      </div>

      {/* ── Form ──────────────────────────────────────────── */}
      <div className="register-form-area">
        <div className="register-form-inner">

          {/* Role cards */}
          <div className={`register-role-grid ${mounted ? 'register-anim-slide-1' : 'register-anim-hidden'}`}>
            {[
              { value: 'buyer',      label: 'Buyer',      icon: <FiShoppingCart size={18} />, desc: 'Discover & bid' },
              { value: 'shopkeeper', label: 'Shopkeeper', icon: <FiShoppingBag  size={18} />, desc: 'List & sell'     },
            ].map(r => (
              <button key={r.value} type="button"
                onClick={() => setForm(f => ({ ...f, role: r.value }))}
                className={`register-role-card ${form.role === r.value ? 'register-role-card--active' : ''}`}>
                {form.role === r.value && <div className="register-role-shimmer-line" />}
                <div className={`register-role-icon ${form.role === r.value ? 'register-role-icon--active' : ''}`}>{r.icon}</div>
                <p className={`register-role-label ${form.role === r.value ? 'register-role-label--active' : ''}`}>{r.label}</p>
                <p className="register-role-desc">{r.desc}</p>
              </button>
            ))}
          </div>

          {/* ── Google button ─────────────────────────────── */}
          <div className={mounted ? 'register-anim-slide-2' : 'register-anim-hidden'}>
            <button
              type="button"
              onClick={() => handleGoogle()}
              disabled={gLoading || loading}
              className="register-google-btn"
            >
              {gLoading ? (
                <svg className="register-spinner" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
              ) : <GoogleIcon />}
              <span>{gLoading ? 'Connecting…' : 'Continue with Google'}</span>
            </button>
          </div>

          {/* ── Divider ───────────────────────────────────── */}
          <div className={`register-divider ${mounted ? 'register-anim-slide-2' : 'register-anim-hidden'}`}>
            <div className="register-divider-line" />
            <span className="register-divider-text">or sign up with email</span>
            <div className="register-divider-line" />
          </div>

          {/* ── Email form ────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="register-form">

            <div className={mounted ? 'register-anim-slide-3' : 'register-anim-hidden'}>
              <label className="register-label">Full Name</label>
              <div className="register-input-wrap">
                <FiUser className="register-input-icon" />
                <input className="register-input" type="text" placeholder="Your full name"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            </div>

            <div className={mounted ? 'register-anim-slide-4' : 'register-anim-hidden'}>
              <label className="register-label">Email Address</label>
              <div className="register-input-wrap">
                <FiMail className="register-input-icon" />
                <input className="register-input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>

            <div className={mounted ? 'register-anim-slide-5' : 'register-anim-hidden'}>
              <label className="register-label">Password</label>
              <div className="register-input-wrap">
                <FiLock className="register-input-icon" />
                <input className="register-input register-input--pr" type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(v => !v)} className="register-eye-btn">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="register-strength-bar">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`register-strength-seg ${i <= strengthLevel ? strengthColors[strengthLevel] : 'bg-slate-200'}`} />
                  ))}
                </div>
              )}
            </div>

            <div className={mounted ? 'register-anim-slide-5' : 'register-anim-hidden'}>
              <button type="submit" disabled={loading || gLoading} className="register-submit-btn">
                <div className="register-submit-shimmer" />
                {loading ? (
                  <>
                    <svg className="register-spinner" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                    </svg>
                    <span className="register-btn-text">Creating account...</span>
                  </>
                ) : (
                  <>
                    <span className="register-btn-text">Create Account</span>
                    <FiArrowRight className="register-btn-arrow" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className={`register-footer-text ${mounted ? 'register-anim-fade-6' : 'register-anim-hidden'}`}>
            Already have an account?{' '}
            <Link to="/login" className="register-footer-link">Log in</Link>
          </p>

          <div className={`register-trust-strip ${mounted ? 'register-anim-fade-7' : 'register-anim-hidden'}`}>
            {['Secure', 'Free Forever', 'No Card'].map(badge => (
              <span key={badge} className="register-trust-badge">
                <span className="register-trust-dot" />{badge}
              </span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
