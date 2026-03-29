import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import BidTimer from '../../components/BidTimer';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';
import { FiPlusCircle, FiPackage, FiSettings, FiSearch, FiStopCircle, FiCheckCircle, FiClock, FiShoppingBag, FiX } from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  const { on, off } = useSocket();
  const [shop, setShop]           = useState(null);
  const [products, setProducts]   = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [endingId, setEndingId]   = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [searchId, setSearchId]     = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError]   = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [modal, setModal] = useState({ open: false, title: '', message: '', onConfirm: null, danger: false, confirmLabel: 'Confirm' });

  const closeModal = () => setModal(m => ({ ...m, open: false }));
  const pendingPaymentProducts = products.filter(p => p.status === 'payment_pending');

  const load = async () => {
    try {
      const [shopRes, prodRes, analyticsRes] = await Promise.all([
        api.get('/shops/my').catch(() => ({ data: { shop: null } })),
        api.get('/products/my').catch(() => ({ data: { products: [] } })),
        api.get('/orders/analytics').catch(() => ({ data: { analytics: null } })),
      ]);
      setShop(shopRes.data.shop);
      setProducts(prodRes.data.products);
      setAnalytics(analyticsRes.data.analytics);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    on('payment_made_by_buyer', (data) => { toast(`💳 ${data.buyerName} submitted payment code!`, { duration: 5000 }); load(); });
    on('auction_reopened', () => { toast('🔄 Auction reopened — all payment windows expired'); load(); });
    return () => { off('payment_made_by_buyer'); off('auction_reopened'); };
  }, []);

  const handleEndAuction = async (productId) => {
    setModal({
      open: true,
      title: 'End Auction Now?',
      message: 'This will immediately close the auction and start the payment window for the highest bidder.',
      danger: true,
      confirmLabel: 'Yes, End Auction',
      onConfirm: async () => {
        closeModal();
        setEndingId(productId);
        try { await api.post(`/payment/${productId}/end`); toast.success('Auction ended!'); load(); }
        catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setEndingId(null); }
      },
    });
  };

  const handleManualToggle = async (productId, newStatus) => {
    const isPaid = newStatus === 'paid';
    setModal({
      open: true,
      title: isPaid ? 'Confirm Payment Received?' : 'Reject Payment?',
      message: isPaid
        ? 'This will confirm the payment and generate an Order ID for the buyer.'
        : 'This will reject the payment, ban this bidder, and move to the next highest bidder.',
      danger: !isPaid,
      confirmLabel: isPaid ? '✅ Yes, Confirm Payment' : '❌ Yes, Reject Payment',
      onConfirm: async () => {
        closeModal();
        setTogglingId(productId);
        try { const { data } = await api.put(`/payment/${productId}/status`, { status: newStatus }); toast.success(data.message); load(); }
        catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setTogglingId(null); }
      },
    });
  };

  const handleSearchOrder = async () => {
    if (!searchId.trim()) return toast.error('Enter an Order ID');
    setSearchLoading(true); setSearchError(''); setSearchResult(null);
    try { const { data } = await api.get(`/payment/orders/search?orderId=${searchId.trim().toUpperCase()}`); setSearchResult(data.order); }
    catch (err) { setSearchError(err.response?.data?.message || 'Order not found'); }
    finally { setSearchLoading(false); }
  };

  const handleConfirmPickup = async (orderId) => {
    try { const { data } = await api.post(`/payment/orders/${orderId}/confirm-pickup-seller`); toast.success(data.message); setSearchResult(prev => prev ? { ...prev, confirmedBySeller: true, status: data.order.status } : prev); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  if (!shop) return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <FiShoppingBag className="text-blue-500 text-3xl" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">No shop yet</h2>
        <p className="text-slate-400 mb-6 text-sm">Set up your shop to start listing products</p>
        <Link to="/shop/setup" className="btn-primary px-8">Set Up Shop</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pb-6">
      {/* Header */}
      <div className="bg-blue-600 -mx-4 px-5 pt-6 pb-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-blue-500 rounded-full animate-blob opacity-40" />
        <div className="absolute bottom-0 left-8 w-20 h-20 bg-blue-700 rounded-full animate-blob delay-2000 opacity-30" />
        <div className="relative z-10">
          <p className="text-blue-200 text-sm mb-1">Good day,</p>
          <h1 className="text-2xl font-extrabold text-white font-display mb-1">{user.name} 👋</h1>
          <p className="text-blue-200 text-xs">{shop.shopName} · {shop.address}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Revenue', value: `₹${analytics?.totalRevenue?.toLocaleString() || 0}`, icon: '💰', color: 'bg-blue-600 text-white' },
          { label: 'Active',  value: analytics?.activeListings  || 0, icon: '🔴', color: 'bg-blue-50 text-blue-700' },
          { label: 'Pending', value: analytics?.pendingPickups  || 0, icon: '📦', color: 'bg-orange-50 text-orange-700' },
          { label: 'Views',   value: analytics?.totalViews      || 0, icon: '👁️', color: 'bg-slate-50 text-slate-700' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-3xl p-4`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-extrabold font-display">{s.value}</p>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link to="/create-listing" className="card flex items-center gap-3 hover:border-blue-200 transition-colors">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0"><FiPlusCircle size={20} /></div>
          <div><p className="font-bold text-slate-800 text-sm">New Listing</p><p className="text-slate-400 text-xs">Upload & sell</p></div>
        </Link>
        <button onClick={() => setShowSearch(s => !s)} className="card flex items-center gap-3 hover:border-blue-200 transition-colors text-left">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0"><FiSearch size={20} /></div>
          <div><p className="font-bold text-slate-800 text-sm">Order Search</p><p className="text-slate-400 text-xs">Find by ID</p></div>
        </button>
        <Link to="/orders/manage" className="card flex items-center gap-3 hover:border-blue-200 transition-colors">
          <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0"><FiPackage size={20} /></div>
          <div><p className="font-bold text-slate-800 text-sm">Orders</p><p className="text-slate-400 text-xs">Manage pickups</p></div>
        </Link>
        <Link to="/shop/setup" className="card flex items-center gap-3 hover:border-blue-200 transition-colors">
          <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center flex-shrink-0"><FiSettings size={20} /></div>
          <div><p className="font-bold text-slate-800 text-sm">Edit Shop</p><p className="text-slate-400 text-xs">Update details</p></div>
        </Link>
      </div>

      {/* Order search */}
      {showSearch && (
        <div className="card mb-5 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800">Search Order by ID</h3>
            <button onClick={() => { setShowSearch(false); setSearchResult(null); setSearchError(''); }} className="text-slate-400 hover:text-slate-600"><FiX /></button>
          </div>
          <div className="flex gap-2 mb-3">
            <input className="input flex-1 font-mono uppercase text-sm" placeholder="SB-XXXXXXXX"
              value={searchId} onChange={e => setSearchId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleSearchOrder()} />
            <button onClick={handleSearchOrder} disabled={searchLoading} className="btn-primary px-4 text-sm">
              {searchLoading ? '...' : 'Find'}
            </button>
          </div>
          {searchError && <p className="text-red-500 text-sm bg-red-50 rounded-2xl px-3 py-2">{searchError}</p>}
          {searchResult && (
            <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={searchResult.product?.imageURL} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{searchResult.product?.title}</p>
                  <p className="text-blue-600 font-bold">₹{searchResult.finalAmount?.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs">{searchResult.buyer?.name} · {searchResult.buyer?.email}</p>
                </div>
                {searchResult.status === 'pickedup'
                  ? <span className="badge-pickedup">✅ Done</span>
                  : <span className="badge-pending">⏳ Pending</span>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`rounded-xl p-2 text-center ${searchResult.confirmedBySeller ? 'bg-green-100 text-green-700' : 'bg-white text-slate-400'}`}>
                  {searchResult.confirmedBySeller ? '✅' : '⏳'} Seller
                </div>
                <div className={`rounded-xl p-2 text-center ${searchResult.confirmedByBuyer ? 'bg-green-100 text-green-700' : 'bg-white text-slate-400'}`}>
                  {searchResult.confirmedByBuyer ? '✅' : '⏳'} Buyer
                </div>
              </div>
              {searchResult.status !== 'pickedup' && !searchResult.confirmedBySeller && (
                <button onClick={() => handleConfirmPickup(searchResult.orderId)} className="btn-primary w-full text-sm py-2.5">
                  ✅ Confirm Pickup
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Payment pending */}
      {pendingPaymentProducts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <h2 className="font-bold text-slate-800">Awaiting Payment ({pendingPaymentProducts.length})</h2>
          </div>
          <div className="space-y-3">
            {pendingPaymentProducts.map(p => (
              <div key={p._id} className="card border-orange-100 space-y-4">
                <div className="flex items-center gap-3">
                  <img src={p.imageURL} alt={p.title} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{p.title}</h3>
                    <p className="text-blue-600 font-bold">₹{p.currentBid?.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs">{p.currentWinner?.name || '—'}</p>
                  </div>
                </div>

                {p.txnCodeEntered ? (
                  <div className="bg-slate-50 rounded-2xl p-3 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Transaction Code Verification</p>
                    <div className="flex flex-wrap gap-2 text-sm items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-xs">Submitted:</span>
                        <span className="font-mono font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg">{p.txnCodeEntered}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-xs">Expected:</span>
                        <span className="font-mono font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-lg">{p.txnCode}</span>
                      </div>
                      {p.txnCodeEntered === p.txnCode
                        ? <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-0.5 rounded-lg">✅ Match</span>
                        : <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-0.5 rounded-lg">❌ Mismatch</span>}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-3 text-center">
                    <p className="text-slate-400 text-sm">⏳ Waiting for buyer to submit payment code</p>
                    {p.txnCode && <p className="text-xs text-slate-400 mt-1">Expected: <span className="font-mono text-blue-500">{p.txnCode}</span></p>}
                  </div>
                )}

                <div>
                  <p className="text-xs text-slate-400 mb-2 font-medium">Manual Override:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleManualToggle(p._id, 'paid')} disabled={togglingId === p._id}
                      className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-semibold text-sm py-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5">
                      <FiCheckCircle size={15} /> {togglingId === p._id ? '...' : 'Mark Paid'}
                    </button>
                    <button onClick={() => handleManualToggle(p._id, 'not_paid')} disabled={togglingId === p._id}
                      className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold text-sm py-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5">
                      <FiStopCircle size={15} /> {togglingId === p._id ? '...' : 'Reject'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Rejecting bans this bidder and moves to next.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800">My Listings</h2>
          <Link to="/create-listing" className="text-blue-600 text-sm font-semibold">+ Add</Link>
        </div>

        {products.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-slate-500 font-medium">No listings yet</p>
            <Link to="/create-listing" className="btn-primary inline-block mt-4 px-6 text-sm">Create Listing</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(p => (
              <div key={p._id} className="card flex gap-3 items-start">
                <img src={p.imageURL} alt={p.title} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 bg-blue-50" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{p.title}</h3>
                    {p.status === 'active'          && <span className="badge-active flex-shrink-0">LIVE</span>}
                    {p.status === 'payment_pending' && <span className="badge-pending flex-shrink-0">PAY</span>}
                    {p.status === 'sold'            && <span className="badge-sold flex-shrink-0">SOLD</span>}
                    {p.status === 'void'            && <span className="badge-void flex-shrink-0">VOID</span>}
                  </div>
                  <p className="text-blue-600 font-bold">₹{p.currentBid?.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs">{p.bidCount} bids · {p.views} views</p>
                  {p.status === 'active' && (
                    <div className="flex items-center justify-between mt-1">
                      <BidTimer endsAt={p.endsAt} />
                      <button onClick={() => handleEndAuction(p._id)} disabled={endingId === p._id}
                        className="bg-red-50 border border-red-200 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 flex-shrink-0">
                        <FiStopCircle size={11} /> {endingId === p._id ? '...' : 'End'}
                      </button>
                    </div>
                  )}
                  {p.status === 'payment_pending' && !p.paymentConfirmedByBuyer && (
                    <p className="text-xs text-orange-500 mt-1 flex items-center gap-1"><FiClock size={10} />Waiting for buyer...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={modal.open}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        danger={modal.danger}
        onConfirm={modal.onConfirm}
        onCancel={closeModal}
      />
    </div>
  );
}
