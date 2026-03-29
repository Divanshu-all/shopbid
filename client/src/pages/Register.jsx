import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiArrowRight, FiShoppingBag, FiShoppingCart } from 'react-icons/fi';

export default function Register() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: params.get('role') || 'buyer' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Blue header */}
      <div className="bg-blue-600 px-5 pt-10 pb-16 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-blue-500 rounded-full animate-blob opacity-50" />
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-blue-700 rounded-full animate-blob delay-3000 opacity-30" />
        <div className="relative z-10">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
            <FiShoppingBag className="text-white text-xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display mb-1">Create account</h1>
          <p className="text-blue-200 text-sm">Free forever. No card needed.</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white rounded-t-4xl -mt-6 px-5 pt-8 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'buyer',      label: 'Buyer',      icon: <FiShoppingCart size={20}/>, desc: 'Discover & bid' },
              { value: 'shopkeeper', label: 'Shopkeeper', icon: <FiShoppingBag size={20}/>,  desc: 'List & sell' },
            ].map(r => (
              <button key={r.value} type="button" onClick={() => setForm(f => ({ ...f, role: r.value }))}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${form.role === r.value ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-200'}`}>
                <div className={`mb-2 ${form.role === r.value ? 'text-blue-600' : 'text-slate-400'}`}>{r.icon}</div>
                <p className={`font-bold text-sm ${form.role === r.value ? 'text-blue-700' : 'text-slate-700'}`}>{r.label}</p>
                <p className="text-xs text-slate-400">{r.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-4 text-slate-400" />
                <input className="input pl-11" placeholder="John Doe"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email</label>
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
                <input className="input pl-11" type="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? 'Creating account...' : <><span>Create Account</span><FiArrowRight /></>}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
