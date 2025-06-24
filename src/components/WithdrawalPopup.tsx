import React, { useEffect, useState } from 'react';

const kenyanNames = [
  'Brian', 'Faith', 'Mwangi', 'Achieng', 'Otieno', 'Wanjiku', 'Kevin', 'Mercy', 'Kimani', 'Sharon',
  'Wycliffe', 'Janet', 'Mutiso', 'Njeri', 'Omondi', 'Chebet', 'Maina', 'Moraa', 'Kiptoo', 'Nafula',
  'Njenga', 'Wambui', 'Barasa', 'Cheruiyot', 'Onyango', 'Makena', 'Kipchoge', 'Winnie', 'Mbugua', 'Nyambura',
];

const getRandomAmount = () => {
  // Random integer between 1000 and 5000, rounded to nearest 50
  return Math.round((Math.random() * (5000 - 1000) + 1000) / 50) * 50;
};

const getRandomName = () => {
  return kenyanNames[Math.floor(Math.random() * kenyanNames.length)];
};

const getRandomAgo = () => {
  const mins = Math.floor(Math.random() * 10); // 0-9 minutes ago
  if (mins === 0) return 'just now';
  if (mins === 1) return '1 minute ago';
  return `${mins} minutes ago`;
};

interface PopupData {
  name: string;
  amount: number;
  ago: string;
}

export const WithdrawalPopup: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [popup, setPopup] = useState<PopupData | null>(null);

  // Show popup every 5 seconds
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const showPopup = () => {
      setPopup({
        name: getRandomName(),
        amount: getRandomAmount(),
        ago: getRandomAgo(),
      });
      setVisible(true);
      // Hide after 3s
      setTimeout(() => setVisible(false), 3000);
      // Next popup in 5s
      timeout = setTimeout(showPopup, 5000);
    };
    // Start after 1s
    timeout = setTimeout(showPopup, 1000);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible || !popup) return null;

  return (
    <div
      className="fixed left-1/2 z-[100] transform -translate-x-1/2 bg-white rounded-xl shadow-2xl flex items-center px-2 py-1 sm:px-6 sm:py-4 min-w-[180px] sm:min-w-[320px] max-w-[95vw] border border-success-200 animate-slide-in top-16 sm:top-20"
      style={{
        boxShadow: '0 6px 32px 0 rgba(0,128,0,0.12)',
        transition: 'all 0.5s cubic-bezier(.4,2.3,.3,1)',
        paddingTop: 'env(safe-area-inset-top, 0px)'
      }}
    >
      <div className="flex-shrink-0 bg-success-100 rounded-full p-1 sm:p-2 mr-2 sm:mr-4">
        <svg width="20" height="20" className="sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#22c55e" opacity="0.2"/><path d="M12 6v6l4 2" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div className="flex-1">
        <div className="font-semibold text-success-700 text-sm sm:text-base mb-0.5 sm:mb-1">
          {popup.name} just withdrew <span className="font-bold text-success-900">KSH {popup.amount.toLocaleString()}</span>
        </div>
        <div className="text-[10px] sm:text-xs text-success-500">{popup.ago}</div>
      </div>
      <button
        className="ml-4 text-success-500 hover:text-success-700 transition-colors text-lg font-bold"
        aria-label="Close"
        onClick={() => setVisible(false)}
      >
        &times;
      </button>
      <style>{`
        @keyframes slideInUp {
          0% { opacity: 0; transform: translateY(40px) scale(0.98); }
          60% { opacity: 1; transform: translateY(-8px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-in {
          animation: slideInUp 0.65s cubic-bezier(.4,2.3,.3,1);
        }
      `}</style>
    </div>
  );
};

export default WithdrawalPopup;
