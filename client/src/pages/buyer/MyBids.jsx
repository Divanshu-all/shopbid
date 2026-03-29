import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import BidTimer from '../../components/BidTimer';
import { FiTrendingUp, FiAward, FiX } from 'react-icons/fi';

export default function MyBids() {
  const [bids, setBids]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bids/my').then(r => setBids(r.data.bids)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading bids...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">My Bids</h1>
        <p className="text-gray-400 text-sm">Auctions you've participated in</p>
      </div>

      {bids.length === 0 ? (
        <div className="card text-center py-16">
          <FiTrendingUp className="text-gray-600 text-5xl mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No bids yet</p>
          <p className="text-gray-600 text-sm mt-1">Place a bid on a live auction to see it here</p>
          <Link to="/browse" className="btn-primary inline-block mt-5 px-8 py-2">Browse Auctions</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map(bid => {
            const product = bid.product;
            const isWinning = product?.currentWinner === bid.bidder || product?.status === 'sold';
            return (
              <Link to={`/product/${product?._id}`} key={bid._id} className="card flex items-start gap-4 hover:border-gray-600 transition-colors block">
                <img src={product?.imageURL} alt={product?.title} className="w-16 h-16 rounded-xl object-cover bg-gray-800 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white text-sm line-clamp-1">{product?.title}</h3>
                    {product?.status === 'active'  && <span className="badge-active flex-shrink-0">LIVE</span>}
                    {product?.status === 'sold'    && <span className="badge-sold flex-shrink-0">SOLD</span>}
                    {product?.status === 'void'    && <span className="badge-void flex-shrink-0">VOID</span>}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">🏪 {product?.shop?.shopName}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <p className="text-gray-500 text-xs">Your Bid</p>
                      <p className="text-white font-bold">₹{bid.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Current Bid</p>
                      <p className="text-brand-teal font-bold">₹{product?.currentBid?.toLocaleString()}</p>
                    </div>
                    {product?.status === 'active' && (
                      <div>
                        <p className="text-gray-500 text-xs">Time Left</p>
                        <BidTimer endsAt={product.endsAt} />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
