import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPackage, FiCheckCircle, FiClock, FiCamera } from 'react-icons/fi';

export default function OrdersManage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const { data } = await api.get('/orders/shop');
      setOrders(data.orders);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-400 text-sm">Manage auction winners and pickups</p>
        </div>
        <Link to="/scan-qr" className="btn-primary flex items-center gap-2 py-2 px-5">
          <FiCamera /> Scan QR Code
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all','pending','pickedup'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-brand-teal text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {f === 'all' ? `All (${orders.length})` : f === 'pending' ? `Pending (${orders.filter(o=>o.status==='pending').length})` : `Picked Up (${orders.filter(o=>o.status==='pickedup').length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <FiPackage className="text-gray-600 text-4xl mx-auto mb-3" />
          <p className="text-gray-400">No orders {filter !== 'all' ? `with status "${filter}"` : 'yet'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order._id} className="card flex flex-col md:flex-row md:items-center gap-4">
              <img src={order.product?.imageURL} alt={order.product?.title} className="w-16 h-16 rounded-xl object-cover bg-gray-800 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{order.product?.title}</h3>
                <p className="text-gray-400 text-sm">Buyer: {order.buyer?.name} · {order.buyer?.email}</p>
                <p className="text-brand-teal font-bold">₹{order.finalAmount?.toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {order.status === 'pending'  && <span className="badge-pending flex items-center gap-1"><FiClock />Awaiting Pickup</span>}
                {order.status === 'pickedup' && <span className="badge-pickedup flex items-center gap-1"><FiCheckCircle />Picked Up</span>}
                <p className="text-gray-600 font-mono text-xs">{order.orderId}</p>
                <p className="text-gray-600 text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
