import { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

export default function BidTimer({ endsAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calc = () => Math.max(0, new Date(endsAt) - new Date());
    setTimeLeft(calc());
    const interval = setInterval(() => {
      const r = calc();
      setTimeLeft(r);
      if (r <= 0) { clearInterval(interval); onExpire?.(); }
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const h = Math.floor(timeLeft / 3600000);
  const m = Math.floor((timeLeft % 3600000) / 60000);
  const s = Math.floor((timeLeft % 60000) / 1000);
  const isUrgent  = timeLeft < 5 * 60 * 1000;
  const isExpired = timeLeft <= 0;

  if (isExpired) return (
    <span className="text-red-500 font-semibold text-xs flex items-center gap-1">
      <FiClock /> Ended
    </span>
  );

  return (
    <div className={`flex items-center gap-1.5 font-mono font-bold text-sm ${isUrgent ? 'text-red-500' : 'text-blue-600'}`}>
      <FiClock size={13} />
      <span>{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</span>
      {isUrgent && <span className="text-[10px] font-sans bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Soon!</span>}
    </div>
  );
}
