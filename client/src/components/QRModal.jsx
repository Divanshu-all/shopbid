import { FiX, FiMapPin, FiPackage, FiCheckCircle } from 'react-icons/fi';

export default function QRModal({ order, onClose }) {
  if (!order) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = order.qrCode;
    a.download = `shopbid-order-${order.orderId}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-4xl w-full max-w-md p-6 pb-10 animate-slide-up" onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FiCheckCircle className="text-green-500 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 font-display">Your Order QR</h2>
          <p className="text-slate-400 text-sm mt-1">Show this at the shop to collect your item</p>
        </div>

        {/* QR Code */}
        <div className="bg-blue-50 rounded-3xl p-5 flex justify-center mb-5">
          <img src={order.qrCode} alt="QR Code" className="w-44 h-44" />
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2 text-sm bg-slate-50 rounded-2xl px-4 py-3">
            <FiPackage className="text-blue-500 flex-shrink-0" />
            <span className="text-slate-700 font-medium">{order.product?.title}</span>
          </div>
          <div className="flex items-center gap-2 text-sm bg-slate-50 rounded-2xl px-4 py-3">
            <FiMapPin className="text-blue-500 flex-shrink-0" />
            <span className="text-slate-600">{order.shop?.shopName} — {order.shop?.address}</span>
          </div>
          <div className="bg-blue-50 rounded-2xl px-4 py-3 text-center">
            <p className="text-xs text-slate-400 mb-0.5">Order ID</p>
            <p className="font-mono text-blue-600 font-bold text-sm tracking-wider">{order.orderId}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">Winning Bid</p>
            <p className="text-slate-800 font-bold text-xl">₹{order.finalAmount?.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleDownload} className="btn-secondary flex-1">Download</button>
          <button onClick={onClose}        className="btn-primary  flex-1">Done</button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-3">Valid for one-time use · Collect within 3 days</p>
      </div>
    </div>
  );
}
