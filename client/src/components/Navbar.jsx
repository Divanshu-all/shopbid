import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShoppingBag, FiHome, FiMap, FiPackage, FiBarChart2, FiPlusCircle, FiList, FiLogOut, FiUser } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isActive  = (path) => location.pathname === path;

  const handleLogout = () => { logout(); navigate('/'); };

  const shopkeeperTabs = [
    { path: '/dashboard',      icon: <FiHome size={22} />,      label: 'Home' },
    { path: '/create-listing', icon: <FiPlusCircle size={22} />, label: 'List' },
    { path: '/orders/manage',  icon: <FiPackage size={22} />,   label: 'Orders' },
    { path: '/analytics',      icon: <FiBarChart2 size={22} />, label: 'Stats' },
  ];
  const buyerTabs = [
    { path: '/browse',    icon: <FiList size={22} />,    label: 'Browse' },
    { path: '/map',       icon: <FiMap size={22} />,     label: 'Map' },
    { path: '/my-orders', icon: <FiPackage size={22} />, label: 'Orders' },
    { path: '/my-bids',   icon: <FiBarChart2 size={22}/>, label: 'Bids' },
  ];

  const tabs = user?.role === 'shopkeeper' ? shopkeeperTabs : user?.role === 'buyer' ? buyerTabs : [];

  return (
    <>
      {/* Top bar */}
      <header className="glass sticky top-0 z-50 border-b border-blue-50 px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg font-display">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <FiShoppingBag className="text-white text-sm" />
          </div>
          <span className="text-blue-600">Shop<span className="text-slate-800">Bid</span></span>
        </Link>

        <div className="flex items-center gap-2">
          {!user && (
            <>
              <Link to="/login"    className="text-sm font-semibold text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
            </>
          )}
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">{user.name[0].toUpperCase()}</span>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors p-2" title="Logout">
                <FiLogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </header>

{/* Sub nav — sits below header */}
      {user && tabs.length > 0 && (
        <nav className="bg-white border-b border-slate-100 md:hidden">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
            {tabs.map(tab => (
              <Link key={tab.path} to={tab.path}
                className={`flex flex-col items-center gap-1 py-2 transition-all ${isActive(tab.path) ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
                <div>{tab.icon}</div>
                <span className="text-[10px] font-semibold">{tab.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Desktop sidebar placeholder — just spacing for bottom nav on mobile */}
      {user && <div className="md:hidden h-0 pb-20" />}
    </>
  );
}
