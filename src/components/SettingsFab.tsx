import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

export default function SettingsFab() {
  const navigate = useNavigate();
  return (
    <button
      className="fixed bottom-6 right-6 z-50 rounded-full bg-primary-600 text-white p-4 shadow-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-4 focus:ring-primary-300"
      onClick={() => {
        const pwd = window.prompt('Enter admin password');
        if (pwd === '2222') {
          navigate('/admin');
        } else if (pwd !== null) {
          window.alert('Incorrect password');
        }
      }}
      aria-label="Open Admin Panel"
    >
      <Settings className="h-7 w-7" />
    </button>
  );
}
