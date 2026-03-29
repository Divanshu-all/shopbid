import { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiCamera, FiCheckCircle, FiAlertTriangle, FiSearch } from 'react-icons/fi';

export default function ScanQR() {
  const [orderId, setOrderId]   = useState('');
  const [order, setOrder]       = useState(null);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleVerify = async () => {
    if (!orderId.trim()) return toast.error('Enter an Order ID');
    setLoading(true);
    setError('');
    setOrder(null);
    setConfirmed(false);
    try {
      const { data } = await api.get(`/orders/verify/${orderId.trim().toUpperCase()}`);
      setOrder(data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found');
    } finally { setLoading(false); }
  };

  const handleConfirmPickup = async () => {
    setLoading(true);
    try {
      await api.put(`/orders/pickup/${order.orderId}`);
      setConfirmed(true);
      toast.success('Pickup confirmed! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error confirming pickup');
    } finally { setLoading(false); }
  };

  const reset = () => { setOrderId(''); setOrder(null); setError(''); setConfirmed(false); };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiCamera className="text-brand-teal text-3xl" />
        </div>
        <h1 className="text-2xl font-bold text-white">Scan / Enter Order ID</h1>
        <p className="text-gray-400 text-sm mt-1">Verify the buyer's QR code and confirm pickup</p>
      </div>

      {/* Input */}
      {!confirmed && (
        <div className="card mb-6">
          <label className="block text-sm text-gray-400 mb-2">Order ID</label>
          <div className="flex gap-3">
            <input
              className="input font-mono uppercase flex-1"
              placeholder="SB-XXXXXXXX"
              value={orderId}
              onChange={e => setOrderId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
            />
            <button onClick={handleVerify} disabled={loading} className="btn-primary px-5 flex items-center gap-2">
              <FiSearch /> {loading ? '...' : 'Verify'}
            </button>
          </div>
          <p className="text-gray-600 text-xs mt-2">Tip: Ask the buyer to show their order QR and read the Order ID below it</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card border-red-500/30 bg-red-500/5 flex items-center gap-3 text-red-400 mb-4">
          <FiAlertTriangle className="flex-shrink-0 text-xl" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Order details */}
      {order && !confirmed && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <img src={order.product?.imageURL} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-800" />
            <div>
              <h3 className="font-semibold text-white">{order.product?.title}</h3>
              <p className="text-brand-teal font-bold">₹{order.finalAmount?.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Buyer</span><span className="text-white font-medium">{order.buyer?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-gray-300">{order.buyer?.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Order ID</span><span className="font-mono text-brand-teal text-xs">{order.orderId}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Status</span><span className="badge-pending">Pending Pickup</span></div>
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleConfirmPickup} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FiCheckCircle /> {loading ? 'Confirming...' : 'Confirm Pickup'}
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {confirmed && (
        <div className="card text-center border-green-500/30 bg-green-500/5 py-10">
          <FiCheckCircle className="text-green-400 text-6xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Pickup Confirmed!</h2>
          <p className="text-gray-400 mb-2">Order <span className="font-mono text-brand-teal">{order?.orderId}</span> has been marked as picked up.</p>
          <p className="text-gray-500 text-sm mb-6">The buyer: {order?.buyer?.name}</p>
          <button onClick={reset} className="btn-primary px-8 py-2">Scan Another</button>
        </div>
      )}
    </div>
  );
}
