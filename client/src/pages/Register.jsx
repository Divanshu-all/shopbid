import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiArrowRight, FiShoppingBag, FiShoppingCart, FiEye, FiEyeOff } from 'react-icons/fi';

const Particle = ({ className }) => <div className={`register-particle ${className}`} />;

export default function Register() {
  const [params]  = useSearchParams();
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: params.get('role') || 'buyer' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const { register } = useAuth();
  const navigate      = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

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

  const strengthLevel = Math.min(4, Math.floor(form.password.length / 3));
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="register-page">

      {/* ── Hero ──────────────────────────────────────────────── */}
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
          <h1 className="register-title">
            Join<br />
            <span className="register-title-accent">ShopBid.</span>
          </h1>
          <p className="register-subtitle">Free forever. No card needed.</p>
        </div>
      </div>

      {/* ── Wave ──────────────────────────────────────────────── */}
      <div className="register-wave-wrap">
        <svg viewBox="0 0 700 40" preserveAspectRatio="none" className="register-wave-svg">
          <path d="M0,10 Q175,30 350,10 T700,10 L700,40 L0,40 Z" fill="white" />
        </svg>
      </div>

      {/* ── Form ──────────────────────────────────────────────── */}
      <div className="register-form-area">
        <div className="register-form-inner">

          {/* Role cards */}
          <div className={`register-role-grid ${mounted ? 'register-anim-slide-1' : 'register-anim-hidden'}`}>
            {[
              { value: 'buyer',      label: 'Buyer',      icon: <FiShoppingCart size={18} />, desc: 'Discover & bid' },
              { value: 'shopkeeper', label: 'Shopkeeper', icon: <FiShoppingBag  size={18} />, desc: 'List & sell'     },
            ].map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r.value }))}
                className={`register-role-card ${form.role === r.value ? 'register-role-card--active' : ''}`}
              >
                {form.role === r.value && <div className="register-role-shimmer-line" />}
                <div className={`register-role-icon ${form.role === r.value ? 'register-role-icon--active' : ''}`}>{r.icon}</div>
                <p className={`register-role-label ${form.role === r.value ? 'register-role-label--active' : ''}`}>{r.label}</p>
                <p className="register-role-desc">{r.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="register-form">

            {/* Name */}
            <div className={mounted ? 'register-anim-slide-2' : 'register-anim-hidden'}>
              <label className="register-label">Full Name</label>
              <div className="register-input-wrap">
                <FiUser className="register-input-icon" />
                <input className="register-input" type="text" placeholder="Your full name"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            </div>

            {/* Email */}
            <div className={mounted ? 'register-anim-slide-3' : 'register-anim-hidden'}>
              <label className="register-label">Email Address</label>
              <div className="register-input-wrap">
                <FiMail className="register-input-icon" />
                <input className="register-input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>

            {/* Password */}
            <div className={mounted ? 'register-anim-slide-4' : 'register-anim-hidden'}>
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
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`register-strength-seg ${i <= strengthLevel ? strengthColors[strengthLevel] : 'bg-slate-200'}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className={mounted ? 'register-anim-slide-5' : 'register-anim-hidden'}>
              <button type="submit" disabled={loading} className="register-submit-btn">
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
                <span className="register-trust-dot" />
                {badge}
              </span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
