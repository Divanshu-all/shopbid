import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../../utils/api';
import BidTimer from '../../components/BidTimer';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const tealIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

export default function MapPage() {
  const [products, setProducts] = useState([]);
  const [userPos, setUserPos]   = useState([30.7333, 76.7794]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(p => setUserPos([p.coords.latitude, p.coords.longitude]));
    api.get('/products').then(r => setProducts(r.data.products)).finally(() => setLoading(false));
  }, []);

  // Group products by shop
  const shopMap = {};
  products.forEach(p => {
    if (p.shop?.location) {
      const key = p.shop._id;
      if (!shopMap[key]) shopMap[key] = { shop: p.shop, products: [] };
      shopMap[key].products.push(p);
    }
  });

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-white">Auction Map</h1>
          <p className="text-gray-400 text-xs">{Object.keys(shopMap).length} shops with live auctions</p>
        </div>
        <Link to="/browse" className="btn-secondary text-sm py-1.5 px-4">List View</Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1 text-gray-400">Loading map...</div>
      ) : (
        <MapContainer center={userPos} zoom={13} style={{ flex: 1, width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />

          {/* User location marker */}
          <Marker position={userPos}>
            <Popup><div className="text-gray-800 font-semibold text-sm">📍 You are here</div></Popup>
          </Marker>

          {/* Shop markers */}
          {Object.values(shopMap).map(({ shop, products: prods }) => (
            <Marker key={shop._id} position={[shop.location.lat, shop.location.lng]} icon={tealIcon}>
              <Popup minWidth={200}>
                <div className="text-gray-800">
                  <p className="font-bold text-sm mb-1">🏪 {shop.shopName}</p>
                  <p className="text-xs text-gray-500 mb-2">{shop.address}</p>
                  <p className="text-xs font-semibold text-gray-600 mb-2">{prods.length} active auction{prods.length > 1 ? 's' : ''}</p>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {prods.map(p => (
                      <a key={p._id} href={`/product/${p._id}`} className="flex items-center gap-2 hover:bg-gray-100 rounded p-1 transition-colors">
                        <img src={p.imageURL} alt={p.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-800 line-clamp-1">{p.title}</p>
                          <p className="text-xs text-green-600 font-bold">₹{p.currentBid?.toLocaleString()}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
