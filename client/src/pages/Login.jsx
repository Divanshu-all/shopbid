import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight, FiShoppingBag } from 'react-icons/fi';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top blue section */}
      <div className="bg-blue-600 px-5 pt-10 pb-16 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full animate-blob opacity-50" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-700 rounded-full animate-blob delay-2000 opacity-30" />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
            <FiShoppingBag className="text-white text-xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display mb-1">Welcome back</h1>
          <p className="text-blue-200 text-sm">Log in to your ShopBid account</p>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-white rounded-t-4xl -mt-6 px-5 pt-8 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email address</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-4 text-slate-400" />
              <input className="input pl-11" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-4 text-slate-400" />
              <input className="input pl-11" type="password" placeholder="Your password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? 'Logging in...' : <><span>Log In</span><FiArrowRight /></>}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6 max-w-md mx-auto">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
