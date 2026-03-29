import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { FiShoppingBag } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const CATEGORIES = ['electronics','clothing','food','furniture','books','sports','other'];

function LocationPicker({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng); } });
  return null;
}

export default function ShopSetup() {
  const [form, setForm] = useState({ shopName: '', description: '', address: '', category: 'other', upiId: '' });
  const [location, setLocation] = useState({ lat: 30.7333, lng: 76.7794 });
  const [markerPos, setMarkerPos] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/shops/my').then(r => { setExisting(r.data.shop); setForm({ shopName: r.data.shop.shopName, description: r.data.shop.description, address: r.data.shop.address, category: r.data.shop.category, upiId: r.data.shop.upiId || '' }); setMarkerPos(r.data.shop.location); }).catch(() => {});
    navigator.geolocation?.getCurrentPosition(p => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }));
  }, []);

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (f) { setPhoto(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!markerPos && !existing) return toast.error('Please pick your shop location on the map');
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    const pos = markerPos || existing?.location;
    fd.append('lat', pos.lat);
    fd.append('lng', pos.lng);
    if (photo) fd.append('photo', photo);
    try {
      if (existing) {
        await api.put(`/shops/${existing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Shop updated!');
      } else {
        await api.post('/shops', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Shop created!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving shop');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <FiShoppingBag className="text-brand-teal text-3xl" />
        <div>
          <h1 className="text-2xl font-bold text-white">{existing ? 'Update Shop' : 'Set Up Your Shop'}</h1>
          <p className="text-gray-400 text-sm">Tell buyers about your shop</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Shop Name *</label>
            <input className="input" placeholder="My Awesome Shop" value={form.shopName} onChange={e => setForm(f => ({ ...f, shopName: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Category</label>
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-gray-800 capitalize">{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Address *</label>
          <input className="input" placeholder="123 Market Street, City" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="What do you sell?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        {/* UPI ID */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">
            UPI ID <span className="text-brand-teal">*</span>
            <span className="text-gray-600 text-xs ml-2">Buyers will pay you on this UPI ID</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-gray-500 text-sm">₹</span>
            <input
              className="input pl-7"
              placeholder="yourname@upi or 9876543210@paytm"
              value={form.upiId}
              onChange={e => setForm(f => ({ ...f, upiId: e.target.value }))}
            />
          </div>
          <p className="text-gray-600 text-xs mt-1">Examples: name@okicici · name@paytm · 9876543210@ybl · name@upi</p>
        </div>

        {/* Photo */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Shop Photo</label>
          <div className="flex items-center gap-4">
            {(preview || existing?.photo) && <img src={preview || existing?.photo} className="w-20 h-20 rounded-xl object-cover border border-gray-700" alt="preview" />}
            <label className="btn-secondary cursor-pointer text-sm py-2 px-4">
              Choose Photo <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>
        </div>

        {/* Map */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">📍 Pin Your Shop Location <span className="text-gray-600">(click on map)</span></label>
          <div className="rounded-xl overflow-hidden border border-gray-700 h-64">
            <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker onPick={(ll) => setMarkerPos({ lat: ll.lat, lng: ll.lng })} />
              {(markerPos || existing?.location) && <Marker position={[markerPos?.lat || existing.location.lat, markerPos?.lng || existing.location.lng]} />}
            </MapContainer>
          </div>
          {markerPos && <p className="text-xs text-brand-teal mt-1">📍 {markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? 'Saving...' : existing ? 'Update Shop' : 'Create Shop'}
        </button>
      </form>
    </div>
  );
}
