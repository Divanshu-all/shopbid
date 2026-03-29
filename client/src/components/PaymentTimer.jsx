import { useState, useEffect } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

export default function PaymentTimer({ deadline, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calc = () => Math.max(0, new Date(deadline) - new Date());
    setTimeLeft(calc());
    const interval = setInterval(() => {
      const r = calc();
      setTimeLeft(r);
      if (r <= 0) { clearInterval(interval); onExpire?.(); }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const m = Math.floor(timeLeft / 60000);
  const s = Math.floor((timeLeft % 60000) / 1000);
  const isExpired = timeLeft <= 0;
  const pct = Math.max(0, (timeLeft / (5 * 60 * 1000)) * 100);

  if (isExpired) return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
      <p className="text-red-600 font-semibold">⏰ Payment window expired</p>
    </div>
  );

  return (
    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-orange-600">
          <FiAlertTriangle size={16} />
          <span className="font-semibold text-sm">Pay within</span>
        </div>
        <span className="font-mono font-bold text-2xl text-orange-600">
          {String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
        </span>
      </div>
      <div className="w-full bg-orange-100 rounded-full h-2">
        <div className="bg-orange-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-orange-500 text-xs mt-2 text-center">or the auction moves to the next bidder</p>
    </div>
  );
}
