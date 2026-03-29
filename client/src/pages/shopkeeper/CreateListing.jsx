import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiImage, FiTag, FiClock, FiUploadCloud, FiArrowLeft } from 'react-icons/fi';

const CATEGORIES = ['electronics','clothing','food','furniture','books','sports','other'];
const DURATIONS  = [{ value: 1, label: '1h' }, { value: 6, label: '6h' }, { value: 12, label: '12h' }, { value: 24, label: '24h' }];

export default function CreateListing() {
  const [form, setForm]       = useState({ title: '', description: '', startPrice: '', buyNowPrice: '', duration: 24, category: 'other' });
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImage = (e) => { const f = e.target.files[0]; if (f) { setImage(f); setPreview(URL.createObjectURL(f)); } };
  const handleDrop  = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) { setImage(f); setPreview(URL.createObjectURL(f)); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return toast.error('Product image required');
    if (!form.title || !form.startPrice) return toast.error('Title and price required');
    setLoading(true);
    const fd = new FormData();
    fd.append('image', image);
    Object.entries(form).forEach(([k,v]) => { if (v !== '') fd.append(k, v); });
    try {
      await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Auction is live! 🚀');
      navigate('/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pb-10">
      {/* Header */}
      <div className="bg-blue-600 -mx-4 px-5 pt-6 pb-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-blue-500 rounded-full animate-blob opacity-40" />
        <button onClick={() => navigate(-1)} className="relative z-10 text-blue-200 flex items-center gap-2 text-sm mb-4 hover:text-white transition-colors">
          <FiArrowLeft /> Back
        </button>
        <h1 className="relative z-10 text-2xl font-extrabold text-white font-display">New Listing</h1>
        <p className="relative z-10 text-blue-200 text-sm">Upload a product and start your auction</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image upload */}
        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
          {preview ? (
            <div className="relative rounded-3xl overflow-hidden aspect-square">
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <button type="button" onClick={() => { setImage(null); setPreview(''); }}
                className="absolute top-3 right-3 bg-red-500 text-white text-xs px-3 py-1.5 rounded-xl font-semibold">Remove</button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-52 bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl cursor-pointer hover:bg-blue-100 transition-colors">
              <FiImage className="text-blue-300 text-5xl mb-3" />
              <p className="text-slate-500 font-semibold text-sm">Tap to upload photo</p>
              <p className="text-slate-400 text-xs mt-1">JPG, PNG, WEBP</p>
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Product Title *</label>
          <input className="input" placeholder="e.g. Sony WH-1000XM5 Headphones"
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="Condition, features, etc."
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Category</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} type="button" onClick={() => setForm(f => ({ ...f, category: c }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${form.category === c ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Start Price (₹) *</label>
            <input className="input" type="number" min="1" placeholder="500"
              value={form.startPrice} onChange={e => setForm(f => ({ ...f, startPrice: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Buy Now (₹)</label>
            <input className="input" type="number" min="1" placeholder="Optional"
              value={form.buyNowPrice} onChange={e => setForm(f => ({ ...f, buyNowPrice: e.target.value }))} />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Auction Duration</label>
          <div className="grid grid-cols-4 gap-2">
            {DURATIONS.map(d => (
              <button key={d.value} type="button" onClick={() => setForm(f => ({ ...f, duration: d.value }))}
                className={`py-3 rounded-2xl text-sm font-bold transition-all ${form.duration === d.value ? 'bg-blue-600 text-white shadow-blue-sm' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base">
          <FiUploadCloud size={20} />
          {loading ? 'Uploading...' : 'Launch Auction 🚀'}
        </button>
      </form>
    </div>
  );
}
