import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import BidTimer from '../../components/BidTimer';
import PaymentTimer from '../../components/PaymentTimer';
import toast from 'react-hot-toast';
import { FiMapPin, FiTrendingUp, FiZap, FiAward, FiBell, FiCreditCard, FiCheckCircle } from 'react-icons/fi';

export default function ProductDetail() {
  const { id }         = useParams();
  const { user }       = useAuth();
  const { joinRoom, leaveRoom, on, off } = useSocket();
  const navigate       = useNavigate();

  const [product, setProduct]         = useState(null);
  const [bids, setBids]               = useState([]);
  const [bidAmount, setBidAmount]     = useState('');
  const [loading, setLoading]         = useState(true);
  const [bidLoading, setBidLoading]   = useState(false);
  const [payLoading, setPayLoading]   = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [outbidAlert, setOutbidAlert] = useState(false);
  const [paymentData, setPaymentData] = useState(null); // { winnerId, deadline, amount }

  const load = async () => {
    try {
      const [prodRes, bidRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/bids/${id}`),
      ]);
      const p = prodRes.data.product;
      setProduct(p);
      setBids(bidRes.data.bids);
      if (p.status === 'payment_pending') {
        setAuctionEnded(true);
        setPaymentData({ winnerId: p.paymentWinner?._id || p.paymentWinner, deadline: p.paymentDeadline, amount: p.currentBid, txnCode: p.txnCode });
      } else if (p.status !== 'active') {
        setAuctionEnded(true);
      }
    } catch {
      toast.error('Product not found');
      navigate('/browse');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    joinRoom(id);

    on('bid_updated', (data) => {
      if (data.productId !== id) return;
      setProduct(prev => prev ? { ...prev, currentBid: data.currentBid, bidCount: data.bidCount, endsAt: data.endsAt } : prev);
      setBids(prev => [{ _id: Date.now(), bidder: { name: data.winnerName }, amount: data.currentBid, createdAt: new Date() }, ...prev]);
      if (data.extended) toast('⏱️ Auction extended by 3 minutes!', { icon: '🔥' });
    });

    on('payment_required', (data) => {
      if (data.productId !== id) return;
      setAuctionEnded(true);
      setPaymentData({ winnerId: data.winnerId, deadline: data.deadline, amount: data.amount, txnCode: data.txnCode });
      setProduct(prev => prev ? { ...prev, status: 'payment_pending', paymentWinner: { _id: data.winnerId }, paymentDeadline: data.deadline, txnCode: data.txnCode } : prev);
      if (data.winnerId === user?._id) toast('🏆 You won! Complete payment now.', { icon: '💳' });
    });

    on('payment_expired', (data) => {
      if (data.productId !== id) return;
      setPaymentData(null);
      if (data.failedUserId === user?._id) {
        toast.error('⛔ You failed to pay. Your bids have been removed and you are banned from this auction.', { duration: 6000 });
      } else {
        toast('⏰ Payment window expired. Moving to next bidder...', { icon: '⚡' });
      }
      setTimeout(load, 2000);
    });

    on('outbid_alert', (data) => {
      if (data.outbidUserId === user?._id) {
        setOutbidAlert(true);
        toast(`You've been outbid! Place a higher bid.`, { icon: '😬' });
      }
    });

    on('auction_reopened', (data) => {
      if (data.productId !== id) return;
      setAuctionEnded(false);
      setPaymentData(null);
      toast('🔄 Auction reopened for 30 more minutes! Place your bid.', { icon: '⚡', duration: 5000 });
      load();
    });

    on('auction_closed', (data) => {
      if (data.productId !== id) return;
      setAuctionEnded(true);
      load();
      toast(data.status === 'void' ? '⚠️ Auction ended with no bids' : '🎉 Auction closed!');
    });

    on('order_created', (data) => {
      if (data.productId !== id) return;
      load();
      if (data.buyerId === user?._id) toast('🎉 Order confirmed! Check your email for QR code.', { duration: 5000 });
    });

    return () => {
      leaveRoom(id);
      off('bid_updated'); off('payment_required'); off('payment_expired');
      off('outbid_alert'); off('auction_closed'); off('order_created'); off('auction_reopened');
    };
  }, [id]);

  const handleBid = async () => {
    if (!bidAmount || isNaN(bidAmount)) return toast.error('Enter a valid bid amount');
    setBidLoading(true);
    setOutbidAlert(false);
    try {
      await api.post(`/bids/${id}`, { amount: parseFloat(bidAmount) });
      toast.success('Bid placed! 🎯');
      setBidAmount('');
    } catch (err) { toast.error(err.response?.data?.message || 'Bid failed'); }
    finally { setBidLoading(false); }
  };

  const [txnInput, setTxnInput] = useState('');

  const handlePayNow = async () => {
    if (!txnInput.trim()) return toast.error('Enter your transaction code');
    setPayLoading(true);
    try {
      await api.post(`/payment/${id}/pay`, { txnCode: txnInput.trim() });
      toast.success('Payment confirmed! Waiting for seller to verify.');
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
    finally { setPayLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading auction...</div>;
  if (!product) return null;

  const isWinner    = product.currentWinner?._id === user?._id || product.currentWinner === user?._id;
  const isPayWinner = paymentData?.winnerId === user?._id || paymentData?.winnerId?.toString() === user?._id;
  const minBid      = (product.currentBid || product.startPrice) + 1;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left — Image */}
        <div>
          <div className="rounded-2xl overflow-hidden bg-gray-800 aspect-square mb-4">
            <img src={product.imageURL} alt={product.title} className="w-full h-full object-contain" />
          </div>
          {product.shop && (
            <div className="card flex items-start gap-3">
              {product.shop.photo && <img src={product.shop.photo} className="w-14 h-14 rounded-xl object-cover bg-gray-800" alt="shop" />}
              <div>
                <p className="font-semibold text-white">🏪 {product.shop.shopName}</p>
                <p className="text-gray-400 text-sm flex items-center gap-1 mt-1"><FiMapPin className="text-brand-teal" />{product.shop.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right — Bid section */}
        <div className="space-y-5">
          <div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full mb-3 inline-block ${
              product.status === 'active' ? 'bg-green-500/20 text-green-400' :
              product.status === 'payment_pending' ? 'bg-orange-500/20 text-brand-orange' :
              'bg-gray-700 text-gray-400'}`}>
              {product.status === 'active' ? '🔴 LIVE' : product.status === 'payment_pending' ? '💳 AWAITING PAYMENT' : product.status.toUpperCase()}
            </span>
            <h1 className="text-2xl font-bold text-white mt-2">{product.title}</h1>
            {product.description && <p className="text-gray-400 text-sm mt-2">{product.description}</p>}
          </div>

          {/* Current bid */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-400 text-sm">Current Bid</p>
                <p className="text-3xl font-extrabold text-brand-teal">₹{product.currentBid?.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm flex items-center gap-1 justify-end"><FiTrendingUp />{product.bidCount} bids</p>
                {product.currentWinner && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <FiAward className="text-brand-orange" />
                    {isWinner ? <span className="text-green-400 font-semibold">You're winning!</span> : product.currentWinner.name}
                  </p>
                )}
              </div>
            </div>
            {product.status === 'active' && <BidTimer endsAt={product.endsAt} onExpire={() => { setAuctionEnded(true); load(); }} />}
          </div>

          {/* Payment window — shown to winner */}
          {product.status === 'payment_pending' && paymentData && (
            <div className="space-y-3">
              <PaymentTimer deadline={paymentData.deadline} onExpire={() => { setPaymentData(null); setTimeout(load, 2000); }} />
              {isPayWinner ? (
                <div className="card border-brand-teal/30 space-y-4">
                  <p className="text-white font-semibold flex items-center gap-2"><FiCreditCard className="text-brand-teal" />You won! Complete your payment</p>

                  {/* Amount */}
                  <div className="bg-gray-800 rounded-xl p-3">
                    <p className="text-gray-400 text-sm">Amount to pay</p>
                    <p className="text-brand-teal text-2xl font-bold">₹{paymentData.amount?.toLocaleString()}</p>
                  </div>

                  {/* Transaction Code — show prominently */}
                  {paymentData.txnCode && (
                    <div className="bg-brand-purple/20 border border-brand-purple/50 rounded-xl p-4 text-center">
                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Your Transaction Code</p>
                      <p className="text-white font-mono font-bold text-3xl tracking-widest">{paymentData.txnCode}</p>
                      <p className="text-gray-500 text-xs mt-2">Include this in the UPI payment note / remarks</p>
                      <button onClick={() => { navigator.clipboard.writeText(paymentData.txnCode); toast.success('Code copied!'); }}
                        className="mt-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-4 py-1.5 rounded-lg transition-colors">
                        Copy Code
                      </button>
                    </div>
                  )}

                  {/* UPI Payment Info */}
                  <div className="bg-gray-800 rounded-xl p-4 space-y-3">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Pay via UPI</p>

                    {/* Shop's own UPI if set */}
                    {product.shop?.upiId && (
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-700">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">{product.shop.shopName}</p>
                          <p className="text-white font-bold text-base font-mono">{product.shop.upiId}</p>
                          <p className="text-gray-500 text-xs mt-0.5">Add <span className="text-brand-purple font-bold">{paymentData.txnCode}</span> in remarks</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => { navigator.clipboard.writeText(product.shop.upiId); toast.success('UPI ID copied!'); }}
                            className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors">Copy</button>
                          <a href={`upi://pay?pa=${product.shop.upiId}&pn=${encodeURIComponent(product.shop.shopName)}&am=${paymentData.amount}&cu=INR&tn=${encodeURIComponent(paymentData.txnCode + ' ShopBid')}`}
                            className="bg-brand-teal text-white text-xs px-3 py-1.5 rounded-lg text-center">Open App</a>
                        </div>
                      </div>
                    )}

                    {/* Default/fallback UPI */}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Platform UPI (fallback)</p>
                        <p className="text-white font-bold text-base font-mono">qweasdzxcok@sbi</p>
                        <p className="text-gray-500 text-xs mt-0.5">Add <span className="text-brand-purple font-bold">{paymentData.txnCode}</span> in remarks</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => { navigator.clipboard.writeText('qweasdzxcok@sbi'); toast.success('UPI ID copied!'); }}
                          className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors">Copy</button>
                        <a href={`upi://pay?pa=qweasdzxcok@sbi&pn=ShopBid&am=${paymentData.amount}&cu=INR&tn=${encodeURIComponent(paymentData.txnCode + ' ShopBid')}`}
                          className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded-lg text-center transition-colors">Open App</a>
                      </div>
                    </div>
                  </div>

                  {/* Buyer enters code to confirm */}
                  <div className="border-t border-gray-700 pt-4 space-y-2">
                    <p className="text-white text-sm font-semibold">After paying, enter the transaction code to confirm:</p>
                    <div className="flex gap-2">
                      <input
                        className="input flex-1 font-mono uppercase tracking-widest text-center text-lg"
                        placeholder="TXN-XXXXXX"
                        value={txnInput}
                        onChange={e => setTxnInput(e.target.value.toUpperCase())}
                        maxLength={10}
                      />
                      <button onClick={handlePayNow} disabled={payLoading} className="btn-primary px-5 flex items-center gap-2 flex-shrink-0">
                        <FiCheckCircle /> {payLoading ? '...' : 'Confirm'}
                      </button>
                    </div>
                    <p className="text-gray-600 text-xs">The code must match exactly — this verifies your payment to the seller</p>
                  </div>
                </div>
              ) : (
                <div className="card text-center py-4 border-orange-500/20">
                  <p className="text-brand-orange font-semibold">⏳ Waiting for winner to pay...</p>
                  <p className="text-gray-500 text-sm mt-1">If they don't pay in time, you may get a chance!</p>
                </div>
              )}
            </div>
          )}

          {/* Outbid alert */}
          {outbidAlert && product.status === 'active' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm">
              <FiBell className="flex-shrink-0" /> You have been outbid! Place a higher bid to stay in the race.
            </div>
          )}

          {/* Bid input — active auctions only */}
          {product.status === 'active' && (() => {
            const isBlacklisted = product.paymentAttempts?.some(id => id === user?._id || id?.toString?.() === user?._id);
            if (isBlacklisted) return (
              <div className="card border-red-500/30 bg-red-500/5 text-center py-5">
                <p className="text-red-400 font-semibold text-lg">🚫 You are banned from this auction</p>
                <p className="text-gray-500 text-sm mt-1">You failed to complete payment and your bids have been removed. You cannot bid on this product again.</p>
              </div>
            );
            return (
            <div className="card space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Your Bid (min ₹{minBid})</label>
                <div className="flex gap-3">
                  <input className="input flex-1 text-lg font-bold" type="number" min={minBid} placeholder={`₹${minBid}`}
                    value={bidAmount} onChange={e => setBidAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBid()} />
                  <button onClick={handleBid} disabled={bidLoading} className="btn-primary px-6 flex items-center gap-2">
                    <FiZap /> {bidLoading ? '...' : 'Bid'}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[minBid, minBid + 50, minBid + 100, minBid + 200].map(v => (
                  <button key={v} onClick={() => setBidAmount(String(v))} className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition-colors">₹{v}</button>
                ))}
              </div>
            </div>
            );
          })()}

          {/* Sold */}
          {product.status === 'sold' && (
            <div className={`card text-center border ${isWinner ? 'border-green-500/30 bg-green-500/5' : 'border-gray-700'}`}>
              {isWinner ? (
                <>
                  <FiCheckCircle className="text-green-400 text-4xl mx-auto mb-2" />
                  <p className="text-green-400 font-semibold text-lg">Order Confirmed!</p>
                  <p className="text-gray-400 text-sm mt-1">Check your email for QR code and head to the shop.</p>
                  <a href="/my-orders" className="btn-primary inline-block mt-3 px-6 py-2 text-sm">View My Orders</a>
                </>
              ) : (
                <p className="text-gray-400">Auction sold. Winner: {product.currentWinner?.name || 'N/A'}</p>
              )}
            </div>
          )}

          {product.status === 'void' && (
            <div className="card text-center py-6"><p className="text-gray-400">⚠️ Auction ended with no successful bids</p></div>
          )}
        </div>
      </div>

      {/* Bid history */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-white mb-4">Bid History ({bids.length})</h2>
        {bids.length === 0 ? (
          <p className="text-gray-500 text-sm">No bids yet. Be the first!</p>
        ) : (
          <div className="space-y-2">
            {bids.map((bid, i) => (
              <div key={bid._id || i} className={`flex items-center justify-between py-3 px-4 rounded-xl ${i === 0 ? 'bg-blue-100 border border-blue-300' : 'bg-slate-50 border border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  {i === 0 && <FiAward className="text-brand-teal" />}
                  <span className="text-slate-800 text-sm font-medium">{bid.bidder?.name}</span>
                  {i === 0 && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">Highest</span>
                </div>
                <div className="text-right">
                  <p className="text-slate-800 font-bold">₹{bid.amount?.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">{new Date(bid.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
