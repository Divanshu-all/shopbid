import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiArrowRight, 
  FiZap, 
  FiMapPin, 
  FiAward, 
  FiPackage, 
  FiCamera, 
  FiClock, 
  FiShoppingBag, 
  FiStar, 
  FiCheckCircle, 
  FiShield,
  FiGithub,
  FiLinkedin,
  FiMail
} from 'react-icons/fi';
import heroImg    from '../assets/wider-hero.png';
import footerImg  from '../assets/footer-car.png';

const steps = [
  { 
    icon: <FiCamera className="text-blue-600" />, 
    title: 'Snap & List',    
    desc: 'Take a quick photo, set your base price, and open a 24-hour live auction in under 60 seconds.',
    highlights: ['No complex inventory syncing', 'Works directly from your smartphone']
  },
  { 
    icon: <FiZap className="text-blue-600" />, 
    title: 'Buyers Bid Live', 
    desc: 'Nearby buyers see your listing on the interactive map and place real-time competitive bids instantly.',
    highlights: ['Push alerts to local users', 'Watch the price go up in real-time']
  },
  { 
    icon: <FiClock className="text-blue-600" />, 
    title: 'Instant UPI Payment',    
    desc: 'Once the 24 hours end, the highest bidder gets a unique transaction code and pays directly via UPI.',
    highlights: ['Direct bank transfers', 'Zero hidden commission fees']
  },
  { 
    icon: <FiPackage className="text-blue-600" />, 
    title: 'Walk-In Pickup', 
    desc: 'The buyer shows their QR Order ID at your physical counter to collect the item. Done — no delivery needed.',
    highlights: ['Increases local footfall', 'No packaging or shipping costs']
  },
];

const features = [
  { icon: <FiZap />, label: 'Real-Time Bidding', sub: 'Instant updates', color: 'bg-blue-50' },
  { icon: <FiMapPin />, label: 'Map Discovery', sub: 'Nearby deals', color: 'bg-sky-50' },
  { icon: <FiShield />, label: 'Snipe Protection', sub: 'Fair endings', color: 'bg-indigo-50' },
  { icon: <FiCheckCircle />, label: 'UPI Payment', sub: 'Secure & fast', color: 'bg-blue-50' },
  { icon: <FiPackage />, label: 'QR Pickup', sub: 'No shipping', color: 'bg-sky-50' },
  { icon: <FiStar />, label: 'Always Free', sub: 'No commissions', color: 'bg-indigo-50' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-white overflow-x-hidden">

      {/* ─── FIXED MOVING OVALS (BACKGROUND) ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[50%] left-[-5%] w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-[-10%] right-[10%] w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '1s' }} />
      </div>

      {/* ─── HERO ─── */}
      <section className="relative flex flex-col min-h-screen">
        <div className="relative z-10 px-5 pt-16 max-w-lg mx-auto w-full text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-blue-100 text-blue-600 text-xs font-bold px-4 py-2 rounded-full mb-6 shadow-sm animate-slide-up">
            <span className="live-dot" />
            Local Auctions · Free Forever
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900 mb-4 animate-slide-up delay-100 font-display">
            Your Local Shop,<br />
            <span className="text-blue-600">Now Live Online.</span>
          </h1>

          <p className="text-slate-500 text-[15px] sm:text-base leading-relaxed mb-8 animate-slide-up delay-200">
            ShopBid lets Himachali shopkeepers auction products live — buyers bid in real-time, pay via UPI, and walk in to collect.
          </p>

          <div className="flex flex-col gap-3 animate-slide-up delay-300 mb-10 max-w-xs mx-auto">
            {user ? (
              <Link to={user.role === 'shopkeeper' ? '/dashboard' : '/browse'}
                className="btn-primary flex items-center justify-center gap-2 text-base w-full py-4 shadow-lg shadow-blue-200/50 hover:-translate-y-1 transition-transform">
                Go to {user.role === 'shopkeeper' ? 'Dashboard' : 'Browse'} <FiArrowRight />
              </Link>
            ) : (
              <>
                <Link to="/register?role=shopkeeper" className="btn-primary flex items-center justify-center gap-2 text-base w-full py-4 shadow-lg shadow-blue-200/50 hover:-translate-y-1 transition-transform">
                  I'm a Shopkeeper <FiArrowRight />
                </Link>
                <Link to="/register?role=buyer" className="btn-secondary flex items-center justify-center gap-2 text-base w-full py-4 bg-white/60 backdrop-blur-sm border-blue-100 hover:bg-white transition-colors">
                  I'm a Buyer
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="relative z-10 w-full flex-1 flex items-end animate-slide-up delay-300">
          <div className="absolute inset-x-0 top-0 h-40 sm:h-56 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-20" />
          <img
            src={heroImg}
            alt="Shopkeeper with live auction"
            className="w-full object-cover object-center h-[350px] sm:h-[450px] lg:h-[600px] 2xl:h-[700px] relative z-10"
          />
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="relative z-10 bg-[#2563EB] py-10 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center text-white">
          <div>
            <p className="text-4xl font-extrabold tracking-tight mb-1">Free</p>
            <p className="text-blue-100 text-sm font-medium opacity-90">Always</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold tracking-tight mb-1">24h</p>
            <p className="text-blue-100 text-sm font-medium opacity-90">Auctions</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold tracking-tight mb-1">Live</p>
            <p className="text-blue-100 text-sm font-medium opacity-90">Bidding</p>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative z-10 px-6 py-24 max-w-xl mx-auto">
        <div className="mb-14 text-center">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Process</p>
          <h2 className="text-3xl font-extrabold text-slate-900 font-display leading-tight">
            Four steps. Zero friction.
          </h2>
        </div>

        <div className="space-y-10 relative">
          <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-slate-200" />
          
          {steps.map((s, i) => (
            <div key={i} className="relative flex items-start gap-6 group">
              <div className="relative z-10 w-12 h-12 flex-shrink-0 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:border-blue-500 group-hover:scale-110 transition-all duration-300">
                {s.icon}
              </div>
              <div className="flex-1 pt-1 bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest mb-2 block">Step 0{i + 1}</span>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">{s.desc}</p>
                <ul className="space-y-2.5">
                  {s.highlights.map((highlight, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                      <FiCheckCircle className="text-blue-400 flex-shrink-0 text-sm" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CAPABILITIES GRID ─── */}
      <section className="relative z-10 px-6 pb-24 max-w-lg mx-auto">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Capabilities</p>
          <h2 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">Everything built in.</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div 
              key={i} 
              className={`${f.color} bg-opacity-70 backdrop-blur-md rounded-[2.5rem] p-7 border border-white shadow-sm hover:shadow-md transition-all duration-300 text-center flex flex-col items-center`}
            >
              <div className="bg-white p-3 rounded-2xl text-blue-600 text-2xl mb-4 shadow-sm">
                {f.icon}
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">{f.label}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {f.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      {!user && (
        <section className="relative z-10 px-5 pb-20 max-w-lg mx-auto">
          <div className="bg-[#2563EB] rounded-[3rem] p-10 text-center relative overflow-hidden shadow-2xl shadow-blue-200">
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold text-white font-display mb-3">Ready to start?</h2>
              <p className="text-blue-100 text-sm mb-8">Join the local marketplace today.<br />No credit card needed.</p>
              <div className="flex flex-col gap-4">
                <Link to="/register" className="bg-white text-blue-600 text-center py-4 rounded-2xl font-bold shadow-xl hover:-translate-y-1 transition-transform">Create Free Account</Link>
                <Link to="/login" className="text-blue-100 text-sm font-medium hover:text-white transition-colors">Already have an account? Login</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 overflow-hidden bg-slate-900">
        <div className="relative w-full flex items-end">
          <img
            src={footerImg}
            alt="Local scenery"
            className="w-full object-cover object-bottom h-[250px] sm:h-[300px] lg:h-[400px] 2xl:h-[500px]"
          />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white via-white/40 to-transparent pointer-events-none" />
          
          {/* Enhanced Footer Content Container */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pt-32 pb-8 px-6 sm:px-10 text-center flex flex-col items-center">
            
            {/* Logo & Tagline */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <FiShoppingBag className="text-white text-base" />
              </div>
              <span className="text-white font-extrabold text-2xl font-display tracking-tight">ShopBid</span>
            </div>
            <p className="text-slate-300 text-xs font-medium tracking-wide mb-8">Hyperlocal Auction Marketplace · Turning Local Shops into Online Stores </p>

            {/* Separator Line */}
            <div className="w-full max-w-2xl h-px bg-slate-700/50 mb-6" />

            {/* Developer & Copyright Info */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl text-slate-400 text-xs font-medium gap-4">
              <p>&copy; {new Date().getFullYear()} ShopBid. All rights reserved.</p>
              
              <div className="flex items-center gap-1.5">
                <span>Developed by</span>
                <span className="text-white font-bold tracking-wide">Divanshu Thakur</span>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-5">
                <a 
                  href="https://github.com/Divanshu-all" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <FiGithub className="text-lg" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/divanshu-thakur-b5b50430b" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <FiLinkedin className="text-lg" />
                </a>
                <a 
                  href="mailto:divanshuthakur021@gmail.com" 
                  className="hover:text-white transition-colors"
                  aria-label="Email"
                >
                  <FiMail className="text-lg" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}