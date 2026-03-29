import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FiTrendingUp, FiPackage, FiEye, FiBarChart2, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function Analytics() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/analytics')
      .then(r => setData(r.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading analytics...</div>;
  if (!data)   return <div className="flex items-center justify-center min-h-screen text-gray-400">No data available</div>;

  const stats = [
    { label: 'Total Revenue',    value: `₹${data.totalRevenue?.toLocaleString()}`, icon: <FiTrendingUp />, color: 'text-brand-teal',   bg: 'bg-brand-teal/10' },
    { label: 'Total Orders',     value: data.totalOrders,    icon: <FiPackage />,  color: 'text-brand-blue',   bg: 'bg-blue-500/10' },
    { label: 'Pending Pickups',  value: data.pendingPickups, icon: <FiClock />,    color: 'text-brand-orange', bg: 'bg-orange-500/10' },
    { label: 'Active Listings',  value: data.activeListings, icon: <FiBarChart2 />, color: 'text-green-400',   bg: 'bg-green-500/10' },
    { label: 'Sold Listings',    value: data.soldListings,   icon: <FiCheckCircle />, color: 'text-brand-purple', bg: 'bg-purple-500/10' },
    { label: 'Total Views',      value: data.totalViews,     icon: <FiEye />,      color: 'text-brand-blue',   bg: 'bg-blue-500/10' },
  ];

  // Simple bar chart data
  const maxRevenue = Math.max(data.totalRevenue, 1);
  const listingStats = [
    { label: 'Active',  value: data.activeListings, color: 'bg-green-500' },
    { label: 'Sold',    value: data.soldListings,   color: 'bg-brand-teal' },
    { label: 'Void',    value: data.voidListings,   color: 'bg-red-500' },
  ];
  const maxListings = Math.max(...listingStats.map(s => s.value), 1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm">Your shop performance overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="card">
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center text-lg mb-3`}>{s.icon}</div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Listing status chart */}
      <div className="card mb-6">
        <h2 className="font-semibold text-white mb-5">Listing Status Breakdown</h2>
        <div className="space-y-4">
          {listingStats.map((s, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-gray-400 text-sm w-14">{s.label}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                <div className={`${s.color} h-3 rounded-full transition-all duration-700`} style={{ width: `${(s.value / maxListings) * 100}%` }} />
              </div>
              <span className="text-white text-sm font-semibold w-8 text-right">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <h2 className="font-semibold text-white mb-4">Recent Orders</h2>
        {data.recentOrders?.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {data.recentOrders?.map((order, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{order.product?.title || 'Product'}</p>
                  <p className="text-gray-500 text-xs font-mono">{order.orderId}</p>
                </div>
                <div className="text-right">
                  <p className="text-brand-teal font-bold text-sm">₹{order.finalAmount?.toLocaleString()}</p>
                  {order.status === 'pending'  && <span className="badge-pending text-xs">Pending</span>}
                  {order.status === 'pickedup' && <span className="badge-pickedup text-xs">Done</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
