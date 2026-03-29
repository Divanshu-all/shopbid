import { useState, useEffect } from 'react';
import api from '../../utils/api';
import QRModal from '../../components/QRModal';
import toast from 'react-hot-toast';
import { FiPackage, FiCheckCircle, FiClock, FiMapPin } from 'react-icons/fi';

export default function MyOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  const load = () => api.get('/orders/my').then(r => setOrders(r.data.orders)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleConfirmPickup = async (orderId) => {
    setConfirmingId(orderId);
    try { const { data } = await api.post(`/payment/orders/${orderId}/confirm-pickup-buyer`); toast.success(data.message); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setConfirmingId(null); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-lg mx-auto px-4 pb-6">
      <div className="pt-5 mb-5">
        <h1 className="text-2xl font-extrabold text-slate-800 font-display">My Orders</h1>
        <p className="text-slate-400 text-sm">Your auction wins</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-slate-600 font-semibold">No orders yet</p>
          <a href="/browse" className="btn-primary inline-block mt-5 px-8 text-sm">Browse Auctions</a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="card">
              <div className="flex items-start gap-3 mb-4">
                <img src={order.product?.imageURL} className="w-16 h-16 rounded-2xl object-cover bg-blue-50 flex-shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-800 text-sm">{order.product?.title}</h3>
                    {order.status === 'pickedup'
                      ? <span className="badge-pickedup flex-shrink-0">Done ✅</span>
                      : <span className="badge-pending flex-shrink-0">Pending</span>}
                  </div>
                  <p className="text-blue-600 font-extrabold text-lg">₹{order.finalAmount?.toLocaleString()}</p>
                  <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                    <FiMapPin size={10} className="text-blue-400" />{order.shop?.shopName}
                  </p>
                </div>
              </div>

              {/* Order ID */}
              <div className="bg-blue-50 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Order ID</p>
                  <p className="font-mono font-bold text-blue-600 tracking-wider text-sm">{order.orderId}</p>
                </div>
                <button onClick={() => setSelected(order)} className="btn-primary text-xs py-2 px-4">Show QR</button>
              </div>

              {/* Pickup status */}
              {order.status !== 'pickedup' && (
                <>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className={`rounded-xl p-2 text-center ${order.confirmedBySeller ? 'bg-green-100 text-green-700 font-semibold' : 'bg-slate-50 text-slate-400'}`}>
                      {order.confirmedBySeller ? '✅' : '⏳'} Seller
                    </div>
                    <div className={`rounded-xl p-2 text-center ${order.confirmedByBuyer ? 'bg-green-100 text-green-700 font-semibold' : 'bg-slate-50 text-slate-400'}`}>
                      {order.confirmedByBuyer ? '✅' : '⏳'} You
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!order.confirmedByBuyer && (
                      <button onClick={() => handleConfirmPickup(order.orderId)} disabled={confirmingId === order.orderId}
                        className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-1.5">
                        <FiCheckCircle size={15} /> {confirmingId === order.orderId ? '...' : 'Confirm Pickup'}
                      </button>
                    )}
                    <a href={`https://maps.google.com/?q=${order.shop?.location?.lat},${order.shop?.location?.lng}`}
                      target="_blank" rel="noreferrer"
                      className="btn-secondary flex items-center gap-1.5 text-sm py-2.5 px-4">
                      <FiMapPin size={14} /> Go
                    </a>
                  </div>
                </>
              )}
              {order.status === 'pickedup' && (
                <p className="text-slate-400 text-xs text-center">Completed {new Date(order.pickedUpAt).toLocaleDateString()}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {selected && <QRModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
