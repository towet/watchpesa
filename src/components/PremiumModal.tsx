import React, { useState } from 'react';

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
}

const packages = [
  {
    name: 'Elite',
    price: 200,
    perVideo: 150,
    features: [
      'Access to premium video categories',
      'Earn up to 150 KSH per video',
      'Daily earning limit: 1,000 KSH',
      'Priority withdrawal processing',
      'Priority customer support',
      'Weekly bonus rewards',
    ],
    highlight: true,
  },
  {
    name: 'Pro',
    price: 100,
    perVideo: 50,
    features: [
      'Access to standard videos',
      'Earn up to 50 KSH per video',
      'Daily earning limit: 500 KSH',
      'Standard withdrawal processing',
    ],
    highlight: false,
  },
];

export const PremiumModal: React.FC<PremiumModalProps> = ({ open, onClose }) => {
  const [selected, setSelected] = useState(0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-40 px-2">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-4 sm:p-8 animate-fade-in-up relative">
        <button
          className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-primary-500"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-1 rounded-full font-semibold text-sm mr-2 ${selected === 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}
            onClick={() => setSelected(0)}
          >
            Elite
          </button>
          <button
            className={`px-4 py-1 rounded-full font-semibold text-sm ${selected === 1 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}
            onClick={() => setSelected(1)}
          >
            Pro
          </button>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="mb-2">
            <span className="inline-block bg-primary-50 rounded-full p-3 mb-2">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#a78bfa" opacity="0.15"/><path d="M12 6v6l4 2" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
          <div className="font-bold text-xl sm:text-2xl mb-1 text-primary-700">{packages[selected].name} Package</div>
          <div className="text-lg font-semibold text-primary-500 mb-2">{packages[selected].price} KSH <span className="text-xs font-normal">/month</span></div>
          <div className="mb-3 text-gray-500 text-xs sm:text-sm">Earn up to {packages[selected].perVideo} KSH per video</div>
          <ul className="mb-4 text-left space-y-2 w-full max-w-xs mx-auto">
            {packages[selected].features.map((f, i) => (
              <li key={i} className="flex items-center text-gray-700 text-xs sm:text-sm">
                <span className="mr-2 text-success-500">✓</span> {f}
              </li>
            ))}
          </ul>
          <button
            className="w-full bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-500 text-white font-bold py-2 rounded-lg shadow-md transition-all mb-2 text-base sm:text-lg"
            onClick={() => {
              if (packages[selected].name === 'Elite') {
                window.open('https://watchpesaelitepackage.netlify.app/', '_blank');
              } else {
                window.open('https://watchpesapremiumpackage.netlify.app/', '_blank');
              }
              onClose();
            }}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
