import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from '../../components/ProductCard';
import { FiSearch, FiMap, FiX } from 'react-icons/fi';

const CATEGORIES = ['all','electronics','clothing','food','furniture','books','sports','other'];
const SORTS = [
  { value: 'endsAt',     label: 'Ending Soon' },
  { value: 'newest',     label: 'Newest'      },
  { value: 'price_low',  label: 'Price: Low'  },
  { value: 'price_high', label: 'Price: High' },
];

const CAT_ICONS = {
  all: '◈', electronics: '⚡', clothing: '◎', food: '◉',
  furniture: '▣', books: '▤', sports: '◈', other: '◦',
};

export default function BuyerHome() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort]         = useState('endsAt');
  const [mounted, setMounted]   = useState(false);

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
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div className="bh-page">

      {/* ── Hero banner ─────────────────────────────────────── */}
      <div className="bh-hero">
        <div className="bh-hero-grid" />
        <div className="bh-hero-ring bh-hero-ring--1" />
        <div className="bh-hero-ring bh-hero-ring--2" />
        <div className="bh-hero-blob bh-hero-blob--tr" />
        <div className="bh-hero-blob bh-hero-blob--bl" />

        {/* Floating dots */}
        {[1,2,3,4,5].map(i => <div key={i} className={`bh-hero-dot bh-hero-dot--${i}`} />)}

        <div className={`bh-hero-content ${mounted ? 'bh-hero-content--in' : ''}`}>
          <div className="bh-hero-live-badge">
            <span className="bh-live-pulse" />
            Live Auctions
          </div>
          <h1 className="bh-hero-title">Find &amp; Bid<br /><span className="bh-hero-title-accent">Near You</span></h1>
          <p className="bh-hero-sub">{products.length} active listings right now</p>
        </div>
      </div>

      {/* ── Search bar ──────────────────────────────────────── */}
      <div className={`bh-search-wrap ${mounted ? 'bh-anim-slide-1' : 'bh-anim-hidden'}`}>
        <div className="bh-search-box">
          <FiSearch className="bh-search-icon" size={16} />
          <input
            className="bh-search-input"
            placeholder="Search auctions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
          />
          {search && (
            <button className="bh-search-clear" onClick={() => { setSearch(''); load(); }}>
              <FiX size={14} />
            </button>
          )}
        </div>
        <Link to="/map" className="bh-map-btn">
          <FiMap size={16} />
          <span>Map</span>
        </Link>
      </div>

      <div className="bh-body">

        {/* ── Category chips ────────────────────────────────── */}
        <div className={`bh-chips-wrap ${mounted ? 'bh-anim-slide-2' : 'bh-anim-hidden'}`}>
          <div className="bh-chips-scroll">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`bh-chip ${category === c ? 'bh-chip--active' : ''}`}
              >
                <span className="bh-chip-icon">{CAT_ICONS[c]}</span>
                <span className="bh-chip-label">{c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Sort pills ────────────────────────────────────── */}
        <div className={`bh-sort-wrap ${mounted ? 'bh-anim-slide-3' : 'bh-anim-hidden'}`}>
          {SORTS.map(s => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={`bh-sort-pill ${sort === s.value ? 'bh-sort-pill--active' : ''}`}
            >
              {sort === s.value && <span className="bh-sort-dot" />}
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Section label ─────────────────────────────────── */}
        <div className={`bh-section-row ${mounted ? 'bh-anim-slide-3' : 'bh-anim-hidden'}`}>
          <span className="bh-section-title">
            {category === 'all' ? 'All Listings' : category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
          <span className="bh-section-count">{products.length} items</span>
        </div>

        {/* ── Grid ──────────────────────────────────────────── */}
        {loading ? (
          <div className="bh-grid">
            {[...Array(6)].map((_,i) => (
              <div key={i} className="bh-skeleton" style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bh-empty">
            <div className="bh-empty-icon-wrap">
              <FiSearch size={28} className="bh-empty-icon" />
            </div>
            <p className="bh-empty-title">No auctions found</p>
            <p className="bh-empty-sub">Try a different category or search term</p>
            <button className="bh-empty-reset" onClick={() => { setCategory('all'); setSearch(''); }}>
              Reset filters
            </button>
          </div>
        ) : (
          <div className="bh-grid">
            {products.map((p, i) => (
              <div key={p._id} className="bh-card-wrap" style={{ animationDelay: `${i * 0.06}s` }}>
                <ProductCard product={p} onExpire={load} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
