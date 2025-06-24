
import { Bell, User, Menu, Key } from 'lucide-react';
import logo from '@/assets/pesalogo.png';
import { Button } from '@/components/ui/button';

export const DashboardHeader = ({ username }: { username?: string }) => {
  return (
    <header className="bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-100/50 sticky top-0 z-50 py-1">
      <div className="px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-24 sm:h-28 max-w-7xl mx-auto">
          {/* Logo and Brand - Mobile optimized */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button variant="ghost" size="sm" className="md:hidden p-2 hover:bg-primary-50 rounded-full">
              <Menu className="h-5 w-5 text-primary-600" />
            </Button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src={logo} alt="WatchPesa" className="h-28 sm:h-32 w-auto"/>
            </div>
          </div>

          {/* User Actions - Mobile optimized with larger touch targets */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" size="sm" className="relative p-2 sm:p-3 hover:bg-primary-50 rounded-full touch-manipulation">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-success-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-lg animate-pulse font-bold">
                3
              </span>
            </Button>
            <Button variant="ghost" size="sm" className="p-2 sm:p-3 hover:bg-primary-50 rounded-full touch-manipulation"
              onClick={() => {
                const pwd = window.prompt('Enter admin password');
                if (pwd === '2222') {
                  window.location.href = '/admin';
                } else if (pwd !== null) {
                  window.alert('Incorrect password');
                }
              }}
              aria-label="Admin Panel"
            >
              <Key className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 px-2 sm:px-3 py-2 hover:bg-primary-50 rounded-full touch-manipulation">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-success rounded-full flex items-center justify-center">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="hidden sm:inline font-medium text-gray-700 text-sm">
                {username || "Guest"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
