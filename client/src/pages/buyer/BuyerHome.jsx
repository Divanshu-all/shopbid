import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from '../../components/ProductCard';
import { FiSearch, FiMap, FiSliders } from 'react-icons/fi';

const CATEGORIES = ['all','electronics','clothing','food','furniture','books','sports','other'];
const SORTS = [{ value: 'endsAt', label: 'Ending Soon' }, { value: 'newest', label: 'Newest' }, { value: 'price_low', label: '↑ Price' }, { value: 'price_high', label: '↓ Price' }];

export default function BuyerHome() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort]         = useState('endsAt');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (search)             params.set('search', search);
      if (category !== 'all') params.set('category', category);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [category, sort]);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-6">
      {/* Header */}
      <div className="pt-5 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-800 font-display">Live Auctions</h1>
        <p className="text-slate-400 text-sm">{products.length} active near you</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-3.5 text-slate-400" size={16} />
          <input className="input pl-10 text-sm" placeholder="Search products..."
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()} />
        </div>
        <Link to="/map" className="btn-secondary px-4 py-3 flex items-center gap-1.5 text-sm">
          <FiMap size={16} /> Map
        </Link>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all capitalize flex-shrink-0 ${category === c ? 'bg-blue-600 text-white shadow-blue-sm' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {SORTS.map(s => (
          <button key={s.value} onClick={() => setSort(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${sort === s.value ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_,i) => <div key={i} className="aspect-square bg-blue-50 rounded-3xl animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-slate-600 font-semibold">No auctions found</p>
          <p className="text-slate-400 text-sm mt-1">Try a different category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map(p => <ProductCard key={p._id} product={p} onExpire={load} />)}
        </div>
      )}
    </div>
  );
}
