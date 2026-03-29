import { Link } from 'react-router-dom';
import { FiMapPin, FiTrendingUp } from 'react-icons/fi';
import BidTimer from './BidTimer';

export default function ProductCard({ product, onExpire }) {
  const { _id, title, imageURL, currentBid, bidCount, endsAt, status, shop, views, category } = product;

  return (
    <Link to={`/product/${_id}`} className="block bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-blue-sm transition-all duration-200 active:scale-95 border border-slate-50">
      {/* Image */}
      <div className="relative aspect-square bg-blue-50">
        <img src={imageURL} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-2.5 right-2.5">
          {status === 'active' && <span className="badge-active">● LIVE</span>}
          {status === 'sold'   && <span className="badge-sold">SOLD</span>}
          {status === 'void'   && <span className="badge-void">VOID</span>}
          {status === 'payment_pending' && <span className="badge-pending">PAYING</span>}
        </div>
        <div className="absolute top-2.5 left-2.5 bg-white/80 backdrop-blur text-slate-600 text-[10px] font-semibold px-2 py-1 rounded-full capitalize">
          {category}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1 mb-1">{title}</h3>

        {shop && (
          <p className="text-slate-400 text-xs flex items-center gap-1 mb-2 truncate">
            <FiMapPin size={10} className="text-blue-400 flex-shrink-0" />
            {shop.shopName}
          </p>
        )}

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-slate-400">Current bid</p>
            <p className="text-blue-600 font-extrabold text-base">₹{currentBid?.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 flex items-center gap-0.5 justify-end"><FiTrendingUp size={9} />{bidCount || 0} bids</p>
            {status === 'active' && <BidTimer endsAt={endsAt} onExpire={onExpire} />}
          </div>
        </div>
      </div>
    </Link>
  );
}
